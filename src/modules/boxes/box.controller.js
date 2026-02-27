const boxService = require('./box.service');

class BoxController {

  // Créer une box
  async create(req, res) {
    try {
      const boxData = req.body;
      const box = await boxService.createBox(boxData);

      return res.status(201).json({
        success: true,
        message: 'Box created successfully',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating the box',
      });
    }
  }

  // Récupérer toutes les box
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        state,
        search
      } = req.query;

      const result = await boxService.getAllBoxes({
        page: Number(page),
        limit: Number(limit),
        state,
        search,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving boxes',
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
        message: error.message || 'Box not found',
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
        message: 'Box updated successfully',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating the box',
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
        message: 'Box deleted successfully',
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Box not found',
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
        message: 'Box state updated successfully',
        data: box,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating the box state',
      });
    }
  }
}

module.exports = new BoxController();
