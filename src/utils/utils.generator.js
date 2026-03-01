const Counter = require('../models/counter.model');

/**
 * Génère un ID séquentiel avec un préfixe donné
 * @param {string} prefix - Le préfixe de l'ID (ex: 'PRD', 'PT')
 * @param {number} paddingLength - La longueur du padding pour le numéro (défaut: 5)
 * @returns {Promise<string>} L'ID généré (ex: 'PRD-00001')
 */
async function generateSequentialId(prefix, paddingLength = 5) {
  const counter = await Counter.findByIdAndUpdate(
    prefix,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = counter.sequence.toString().padStart(paddingLength, '0');
  return `${prefix}-${sequenceNumber}`;
}

/**
 * Génère un ID pour un produit (PRD-xxxxx)
 * @returns {Promise<string>}
 */
async function generateProductId() {
  return await generateSequentialId('PRD');
}

/**
 * Génère un ID pour un type de produit (PT-xxxxx)
 * @returns {Promise<string>}
 */
async function generateProductTypeId() {
  return await generateSequentialId('PT');
}

/**
 * Génère un ID pour un panier (PNX-xxxxx)
 * @returns {Promise<string>}
 */
async function generatePanierId() {
  return await generateSequentialId('PNX');
}

/**
 * Génère un ID pour une commande (CMD-xxxxx)
 * @returns {Promise<string>}
 */
async function generateCommandId() {
  return await generateSequentialId('CMD');
}

module.exports = {
  generateSequentialId,
  generateProductId,
  generateProductTypeId,
  generatePanierId,
  generateCommandId,
};
