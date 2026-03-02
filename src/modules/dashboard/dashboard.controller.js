const dashboardService = require('./dashboard.service');
const shopRepository = require('../shops/shop.repository');

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
				message: error.message || 'Erreur lors de la récupération du tableau de bord admin',
			});
		}
	}

    async getAdminNetSales(req, res) {
        try {
            const { year } = req.query;
            const data = await dashboardService.getAdminNetSales(year);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des ventes nettes',
            });
        }
    }

    async getBoutiqueOverview(req, res) {
        try {
            const userId = req.user.sub;
            const { year } = req.query;
            const data = await dashboardService.getBoutiqueOverview(userId, year);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération du tableau de bord boutique',
            });
        }
    }

    async getBoutiqueNetSales(req, res) {
        try {
            const userId = req.user.sub;
            const { year } = req.query;
            const shops = await shopRepository.findByOwnerUserId(userId);
            if (!shops || shops.length === 0) {
                return res.status(404).json({ success: false, message: 'Aucune boutique trouvée' });
            }
            const boutiqueId = shops[0]._id.toString();
            const data = await dashboardService.getBoutiqueNetSales(boutiqueId, year);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des ventes nettes de la boutique',
            });
        }
    }
    async getBoutiqueNetSalesToday(req, res) {
        try {
            const userId = req.user.sub;
            const shops = await shopRepository.findByOwnerUserId(userId);
            if (!shops || shops.length === 0) {
                return res.status(404).json({ success: false, message: 'Aucune boutique trouv\u00e9e' });
            }
            const boutiqueId = shops[0]._id.toString();
            const data = await dashboardService.getBoutiqueNetSalesToday(boutiqueId);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des ventes du jour de la boutique",
            });
        }
    }
}

module.exports = new DashboardController();
