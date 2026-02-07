const boxRepository = require('./box.repository');

class BoxService {

  // Créer une box
  async createBox(boxData) {

    // Validation champs obligatoires
    if (!boxData._id) {
      throw new Error('L’identifiant de la box est obligatoire');
    }

    if (!boxData.label) {
      throw new Error('Le label est obligatoire');
    }

    if (boxData.rent == null || boxData.rent <= 0) {
      throw new Error('Le prix de location doit être supérieur à 0');
    }

    // Validation state
    const validStates = ['AVAILABLE', 'RENTED', 'REPAIR'];
    if (boxData.state && !validStates.includes(boxData.state)) {
      throw new Error('État de box invalide');
    }

    // Vérifier unicité de l'ID
    const existingBox = await boxRepository.findById(boxData._id);
    if (existingBox) {
      throw new Error('Une box avec cet identifiant existe déjà');
    }

    return await boxRepository.create(boxData);
  }

  // Récupérer toutes les box
  async getAllBoxes() {
    return await boxRepository.findAll();
  }

  // Récupérer une box par ID
  async getBoxById(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }
    return box;
  }

  // Mettre à jour une box
  async updateBox(boxId, updateData) {

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    // Validation state
    if (updateData.state) {
      const validStates = ['AVAILABLE', 'RENTED', 'REPAIR'];
      if (!validStates.includes(updateData.state)) {
        throw new Error('État de box invalide');
      }

      // Règle métier exemple
      if (box.state === 'REPAIR' && updateData.state === 'RENTED') {
        throw new Error('Une box en réparation ne peut pas être louée');
      }
    }

    // Validation rent
    if (updateData.rent != null && updateData.rent <= 0) {
      throw new Error('Le prix de location doit être supérieur à 0');
    }

    return await boxRepository.update(boxId, updateData);
  }

  // Supprimer une box
  async deleteBox(boxId) {

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    // Optionnel : interdire suppression si louée
    if (box.state === 'RENTED') {
      throw new Error('Impossible de supprimer une box en cours de location');
    }

    return await boxRepository.delete(boxId);
  }

  // Changer l’état d’une box
  async changeBoxState(boxId, newState) {

    const validStates = ['AVAILABLE', 'RENTED', 'REPAIR'];
    if (!validStates.includes(newState)) {
      throw new Error('État de box invalide');
    }

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    if (box.state === 'REPAIR' && newState === 'RENTED') {
      throw new Error('Une box en réparation ne peut pas être louée');
    }

    return await boxRepository.update(boxId, { state: newState });
  }
}

module.exports = new BoxService();
