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
				message: error.message || 'Erreur lors de la recuperation du dashboard admin',
			});
		}
	}
}

module.exports = new DashboardController();
