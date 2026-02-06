const boxService = require('./box.service');

class BoxController {

  // Créer une box
  async create(req, res) {
    try {
      const boxData = req.body;
      const box = await boxService.createBox(boxData);

      return res.status(201).json({
        success: true,
        message: 'Box créée avec succès',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la box',
      });
    }
  }

  // Récupérer une box par ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const box = await boxService.getBoxById(id);

      return res.status(200).json({
        success: true,
        data: box,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Box non trouvée',
      });
    }
  }

  // Récupérer toutes les box
  async getAll(req, res) {
    try {
      const boxes = await boxService.getAllBoxes();

      return res.status(200).json({
        success: true,
        data: boxes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des box',
      });
    }
  }

  // Mettre à jour une box
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const box = await boxService.updateBox(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Box mise à jour avec succès',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la box',
      });
    }
  }

  // Supprimer une box
  async delete(req, res) {
    try {
      const { id } = req.params;
      await boxService.deleteBox(id);

      return res.status(200).json({
        success: true,
        message: 'Box supprimée avec succès',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Box non trouvée',
      });
    }
  }

  // Changer l’état d’une box
  async changeState(req, res) {
    try {
      const { id } = req.params;
      const { state } = req.body;

      const box = await boxService.changeBoxState(id, state);

      return res.status(200).json({
        success: true,
        message: 'État de la box mis à jour avec succès',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de l’état',
      });
    }
  }
}

module.exports = new BoxController();
