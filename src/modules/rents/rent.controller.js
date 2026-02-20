const rentService = require('./rent.service');

class RentController {

    // POST /api/rents
    async createRent(req, res) {
        try {
            const rent = await rentService.createRent(req.body);
            res.status(201).json({
                success: true,
                data: rent,
                message: 'Rent created successfully'
            });
        } catch (error) {
            res.status(400).json({ 
                success: false,
                message: error.message,
             });
        }
    }

    // GET /api/rents
    async getAllRents(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const rents = await rentService.getAllRents(page, limit);
            res.json({
                success: true,
                data: rents.data,
                pagination: rents.pagination,
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message,
             });
        }
    }

    // GET /api/rents/:id
    async getRentById(req, res) {
        try {
            const rent = await rentService.getRentById(req.params.id);
            if (!rent) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Rent not found',
                 });
            }
            res.json({
                success: true,
                data: rent
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message,
             });
        }
    }

    // PUT /api/rents/:id
    async updateRent(req, res) {
        try {
            const rent = await rentService.updateRent(req.params.id, req.body);
            res.json({
                success: true,
                data: rent,
                message: 'Rent updated successfully'
            });
        } catch (error) {
            res.status(400).json({ 
                success: false,
                message: error.message,
             });
        }
    }

    // DELETE /api/rents/:id
    async deleteRent(req, res) {
        try {
            await rentService.deleteRent(req.params.id);
            res.json({
                success: true,
                message: 'Rent deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message,
             });
        }
    }

    // PATCH /api/rents/:id/pay
    async payRent(req, res) {
        try {
            const result = await rentService.payRentById(req.params.id, req.body.userId, req.body.periode);
            res.json({
                success: true,
                data: result,
                message: 'Rent paid successfully'
            });
        } catch (error) {
            res.status(400).json({ 
                success: false,
                message: error.message,
             });
        }
    }
}

module.exports = new RentController();