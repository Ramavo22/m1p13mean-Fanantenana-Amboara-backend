const mongoose = require('mongoose');
const panierRepository = require('./panier.repository');
const { generatePanierId, generateSequentialId } = require('../../utils/utils.generator');
const transactionRepository = require('../transactions/transaction.repository');
const mvtStockRepository = require('../mvt-stock/mvtStock.repository');
const productRepository = require('../products/product.repository');
const userRepository = require('../users/user.repository');

class PanierService {
  /**
   * Calcule le total à partir de la liste des items
   */
  _computeTotal(items = []) {
    return items.reduce((sum, item) => sum + item.price * item.qte, 0);
  }

  /**
   * Crée un nouveau panier pour l'acheteur connecté.
   * Si etat === 'VALIDATED', exécute dans une transaction MongoDB :
   *   - Vérification du solde de l'acheteur
   *   - Débit du solde
   *   - Création de la transaction ACHAT (avec panierId)
   *   - Mouvement de stock VENTE + décrémentation du stock produit pour chaque article
   */
  async create(acheteurId, items = [], etat = 'PENDING') {
    if (!items.length) {
      throw new Error('Le panier doit contenir au moins un article');
    }

    const etatValue = etat === 'VALIDATED' ? 'VALIDATED' : 'PENDING';
    const total = this._computeTotal(items);

    // Règle : un seul panier PENDING autorisé par acheteur
    const existingPending = await panierRepository.findPendingByAcheteurId(acheteurId);
    if (existingPending) {
      throw new Error(`Un panier en attente existe déjà (id: ${existingPending._id}). Veuillez le valider ou le supprimer avant d'en créer un nouveau.`);
    }

    // Pré-génération des IDs hors session (les compteurs ne sont pas transactionnels)
    const _id = await generatePanierId();
    const mvtIds = [];
    for (let i = 0; i < items.length; i++) {
      mvtIds.push(await generateSequentialId('MVT'));
    }

    if (etatValue === 'PENDING') {
      return panierRepository.create({ _id, acheteurId, items, total, date: new Date(), etat: etatValue });
    }

    // --- Processus VALIDATED avec rollback manuel (compatible standalone MongoDB) ---
    // État de compensation pour annuler les opérations déjà effectuées en cas d'erreur
    let panier = null;
    let soldeDebite = false;
    let transactionCreee = null;
    const mvtsCrees = [];
    const stocksDecrementés = [];

    try {
      // 1. Vérifications AVANT toute écriture
      const user = await userRepository.findById(acheteurId);
      if (!user) throw new Error('Utilisateur introuvable');
      if (user.profile.solde < total) {
        throw new Error(`Solde insuffisant (solde: ${user.profile.solde}, total: ${total})`);
      }

      // Vérification du stock pour chaque produit
      for (const item of items) {
        const product = await productRepository.findById(item.productId);
        if (!product) {
          throw new Error(`Produit introuvable : ${item.productId}`);
        }
        if (product.stock < item.qte) {
          throw new Error(`Stock insuffisant pour "${product.name}" (stock disponible: ${product.stock}, quantité demandée: ${item.qte})`);
        }
      }

      // 2. Créer le panier
      panier = await panierRepository.create(
        { _id, acheteurId, items, total, date: new Date(), etat: etatValue }
      );

      // 3. Débiter le solde
      await userRepository.decrementSolde(acheteurId, total);
      soldeDebite = true;

      // 4. Créer la transaction ACHAT avec panierId
      transactionCreee = await transactionRepository.create(
        { type: 'ACHAT', total, userId: acheteurId, panierId: _id, date: new Date() }
      );

      // 5. Pour chaque article : mouvement VENTE + décrémentation du stock
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const mvt = await mvtStockRepository.create(
          { _id: mvtIds[i], produitId: item.productId, qte: item.qte, reason: 'VENTE' }
        );
        mvtsCrees.push(mvt._id);
        await productRepository.decrementStock(item.productId, item.qte);
        stocksDecrementés.push({ productId: item.productId, qte: item.qte });
      }

      return panier;

    } catch (err) {
      // --- Rollback dans l'ordre inverse ---
      // Ré-incrémenter les stocks produits
      for (const { productId, qte } of stocksDecrementés.reverse()) {
        await productRepository.incrementStock(productId, qte).catch(() => {});
      }
      // Supprimer les mouvements de stock créés
      for (const mvtId of mvtsCrees) {
        await mvtStockRepository.deleteById(mvtId).catch(() => {});
      }
      // Supprimer la transaction ACHAT
      if (transactionCreee) {
        await transactionRepository.deleteById(transactionCreee._id).catch(() => {});
      }
      // Ré-créditer le solde
      if (soldeDebite) {
        await userRepository.incrementSolde(acheteurId, total).catch(() => {});
      }
      // Supprimer le panier créé
      if (panier) {
        await panierRepository.delete(_id).catch(() => {});
      }

      throw err;
    }
  }

  /**
   * Met à jour un panier existant (items, etat)
   */
  async update(id, updateData) {
    const panier = await panierRepository.findById(id);
    if (!panier) throw new Error('Panier introuvable');

    if (panier.etat === 'VALIDATED') {
      throw new Error('Un panier validé ne peut plus être modifié');
    }

    // Recalcul du total si les items changent
    if (updateData.items) {
      updateData.total = this._computeTotal(updateData.items);
    }

    const updated = await panierRepository.update(id, updateData);
    if (!updated) throw new Error('Panier introuvable');
    return updated;
  }

  /**
   * Valide un panier (PENDING → VALIDATED)
   */
  async validate(id) {
    const panier = await panierRepository.findById(id);
    if (!panier) throw new Error('Panier introuvable');

    if (panier.etat === 'VALIDATED') {
      throw new Error('Le panier est déjà validé');
    }

    return panierRepository.update(id, { etat: 'VALIDATED' });
  }

  /**
   * Supprime un panier
   */
  async delete(id) {
    const panier = await panierRepository.findById(id);
    if (!panier) throw new Error('Panier introuvable');

    const deleted = await panierRepository.delete(id);
    if (!deleted) throw new Error('Panier introuvable');
    return deleted;
  }

  async getById(id) {
    const panier = await panierRepository.findById(id);
    if (!panier) throw new Error('Panier introuvable');
    return panier;
  }

  async getAll(page = 1, limit = 10) {
    return panierRepository.findAll(page, limit);
  }

  /**
   * Récupère les paniers de l'acheteur connecté
   */
  async getMyPaniers(acheteurId, page = 1, limit = 10) {
    return panierRepository.findByAcheteurId(acheteurId, page, limit);
  }

  /**
   * Retourne le panier PENDING de l'acheteur, ou null s'il n'en a pas
   */
  async getMyPendingPanier(acheteurId) {
    return panierRepository.findPendingByAcheteurId(acheteurId);
  }
}

module.exports = new PanierService();
