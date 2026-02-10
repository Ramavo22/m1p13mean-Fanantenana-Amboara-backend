const boxRepository = require('./box.repository');
const userRepository = require('../users/user.repository');
const BoxUtils = require('./box.utils');

class BoxService {

  async assignateOrDesassignateUserToBox(assignationInformation) {
    const box = await boxRepository.findById(assignationInformation.boxId);
    if (!box) {
      throw new Error("la box n'est pas trouvée");
    }

    let user = null;

    if (assignationInformation.isAssignate) {
      // 🔒 ASSIGNATION

      if (box.userId) {
        throw new Error("la box est déjà assignée");
      }
      if (!BoxUtils.validateStateChange(box.state, 'RENTED')) {
        throw new Error('Impossible d’assigner une box dans cet état');
      }

      user = await userRepository.findById(assignationInformation.userId);
      if (!user) {
        throw new Error("l'utilisateur n'est pas trouvé");
      }

      box.userId = user._id;
      box.state = 'RENTED';

    } else {
      // 🔓 DÉSAFFECTATION

      if (!box.userId) {
        throw new Error("la box n'est pas assignée");
      }

      if (!BoxUtils.validateStateChange(box.state, 'AVAILABLE')) {
        throw new Error('Impossible de désassigner une box dans cet état');
      }

      box.userId = null;
      box.state = 'AVAILABLE';
    }

    const boxUpdated = await boxRepository.update(box._id, box);
    const isAssignate = assignationInformation.isAssignate
    return { boxUpdated, isAssignate };
  }


  async createBox(boxData) {
    if (!boxData.label) {
      throw new Error('Le label est obligatoire');
    }

    if (boxData.rent == null || boxData.rent <= 0) {
      throw new Error('Le prix de location doit être supérieur à 0');
    }

    if (boxData.state && !BoxUtils.validateState(boxData.state)) {
      throw new Error('État de box invalide');
    }

    const existingBox = await boxRepository.findById(boxData._id);
    if (existingBox) {
      throw new Error('Une box avec cet identifiant existe déjà');
    }

    return await boxRepository.create(boxData);
  }

  async getAllBoxes(params) {
    return await boxRepository.findAll(params);
  }

  async getBoxById(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }
    return box;
  }

  async updateBox(boxId, updateData) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    if (updateData.state) {
      if (!BoxUtils.validateState(updateData.state)) {
        throw new Error('État de box invalide');
      }

      if (!BoxUtils.validateStateChange(box.state, updateData.state)) {
        throw new Error('Transition d’état non autorisée');
      }
    }

    if (updateData.rent != null && updateData.rent <= 0) {
      throw new Error('Le prix de location doit être supérieur à 0');
    }

    return await boxRepository.update(boxId, updateData);
  }

  async deleteBox(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    if (box.state === 'RENTED') {
      throw new Error('Impossible de supprimer une box en cours de location');
    }

    return await boxRepository.delete(boxId);
  }

  async changeBoxState(boxId, newState) {
    if (!BoxUtils.validateState(newState)) {
      throw new Error('État de box invalide');
    }

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box non trouvée');
    }

    if (!BoxUtils.validateStateChange(box.state, newState)) {
      throw new Error('Transition d’état non autorisée');
    }

    return await boxRepository.update(boxId, { state: newState });
  }
}

module.exports = new BoxService();
