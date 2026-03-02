const boxRepository = require('./box.repository');
const BoxUtils = require('./box.utils');

class BoxService {

  async createBox(boxData) {
    if (!boxData.label) {
      throw new Error('Le libellé de la box est obligatoire');
    }

    if (boxData.rent == null || boxData.rent < 0) {
      throw new Error('Le prix du loyer doit être supérieur ou égal à 0');
    }

    if (boxData.state && !BoxUtils.validateState(boxData.state)) {
      throw new Error('État de box invalide');
    }

    const existingBox = await boxRepository.findById(boxData._id);
    if (existingBox) {
      throw new Error('Une box avec cet ID existe déjà');
    }

    return await boxRepository.create(boxData);
  }

  async getAllBoxes(params) {
    return await boxRepository.findAll(params);
  }

  async getBoxById(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box introuvable');
    }
    return box;
  }

  async updateBox(boxId, updateData) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box introuvable');
    }

    if (updateData.state) {
      if (!BoxUtils.validateState(updateData.state)) {
        throw new Error('État de box invalide');
      }

      if (!BoxUtils.validateStateChange(box.state, updateData.state)) {
        throw new Error('Transition d\'état invalide');
      }
    }

    if (updateData.rent != null && updateData.rent < 0) {
      throw new Error('Le prix du loyer doit être supérieur ou égal à 0');
    }

    return await boxRepository.update(boxId, updateData);
  }

  async deleteBox(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box introuvable');
    }

    if (box.state === 'RENTED') {
      throw new Error('Une box louée ne peut pas être supprimée');
    }

    return await boxRepository.delete(boxId);
  }

  async changeBoxState(boxId, newState) {
    if (!BoxUtils.validateState(newState)) {
      throw new Error('État de box invalide');
    }

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box introuvable');
    }

    if (!BoxUtils.validateStateChange(box.state, newState)) {
      throw new Error('Transition d\'état invalide');
    }

    return await boxRepository.update(boxId, { state: newState });
  }

}

module.exports = new BoxService();
