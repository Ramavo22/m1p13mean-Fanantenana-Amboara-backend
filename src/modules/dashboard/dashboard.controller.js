const dashboardService = require('./dashboard.service');

class DashboardController {
	async getAdminOverview(req, res) {
		try {
			const data = await dashboardService.getAdminOverview();

			return res.status(200).json({
				success: true,
				data,
			});
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error.message || 'Error trying to get admin dashboard overview',
			});
		}
	}

    async getNetSales(req, res) {
        try {
            const { year } = req.query;
            const data = await dashboardService.getNetSales(year);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error trying to get net sales',
            });
        }
    }
}

module.exports = new DashboardController();
