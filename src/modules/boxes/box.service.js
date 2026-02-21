const boxRepository = require('./box.repository');
const BoxUtils = require('./box.utils');

class BoxService {

  async createBox(boxData) {
    if (!boxData.label) {
      throw new Error('The box label is required');
    }

    if (boxData.rent == null || boxData.rent < 0) {
      throw new Error('The rent price must be greater than or equal to 0');
    }

    if (boxData.state && !BoxUtils.validateState(boxData.state)) {
      throw new Error('Invalid box state');
    }

    const existingBox = await boxRepository.findById(boxData._id);
    if (existingBox) {
      throw new Error('A box with this ID already exists');
    }

    return await boxRepository.create(boxData);
  }

  async getAllBoxes(params) {
    return await boxRepository.findAll(params);
  }

  async getBoxById(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box not found');
    }
    return box;
  }

  async updateBox(boxId, updateData) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box not found');
    }

    if (updateData.state) {
      if (!BoxUtils.validateState(updateData.state)) {
        throw new Error('Invalid box state');
      }

      if (!BoxUtils.validateStateChange(box.state, updateData.state)) {
        throw new Error('Invalid state transition');
      }
    }

    if (updateData.rent != null && updateData.rent < 0) {
      throw new Error('The rent price must be greater than or equal to 0');
    }

    return await boxRepository.update(boxId, updateData);
  }

  async deleteBox(boxId) {
    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box not found');
    }

    if (box.state === 'RENTED') {
      throw new Error('A rented box cannot be deleted');
    }

    return await boxRepository.delete(boxId);
  }

  async changeBoxState(boxId, newState) {
    if (!BoxUtils.validateState(newState)) {
      throw new Error('Invalid box state');
    }

    const box = await boxRepository.findById(boxId);
    if (!box) {
      throw new Error('Box not found');
    }

    if (!BoxUtils.validateStateChange(box.state, newState)) {
      throw new Error('Invalid state transition');
    }

    return await boxRepository.update(boxId, { state: newState });
  }

}

module.exports = new BoxService();
