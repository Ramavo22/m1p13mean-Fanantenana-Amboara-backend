const Box = require('../boxes/box.model');
const User = require('../users/users.model');
const Transaction = require('../transactions/transactions.model');

class DashboardService {
	async getBoxesSituation() {
		const boxStates = ['AVAILABLE', 'RENTED'];

		const [totalBoxes, boxesByStateRaw] = await Promise.all([
			Box.countDocuments(),
			Box.aggregate([
				{
					$group: {
						_id: '$state',
						count: { $sum: 1 },
					},
				},
			]),
		]);

		const boxesByState = boxStates.reduce((accumulator, state) => {
			accumulator[state] = 0;
			return accumulator;
		}, {});

		for (const item of boxesByStateRaw) {
			if (item?._id && Object.prototype.hasOwnProperty.call(boxesByState, item._id)) {
				boxesByState[item._id] = item.count;
			}
		}

		return {
			total: totalBoxes,
			byState: boxesByState,
		};
	}

	async getUsersSituation() {
		const userRoles = ['ADMIN', 'BOUTIQUE', 'ACHETEUR'];

		const [totalUsers, usersByRoleRaw] = await Promise.all([
			User.countDocuments(),
			User.aggregate([
				{
					$group: {
						_id: '$role',
						count: { $sum: 1 },
					},
				},
			]),
		]);

		const usersByRole = userRoles.reduce((accumulator, role) => {
			accumulator[role] = 0;
			return accumulator;
		}, {});

		for (const item of usersByRoleRaw) {
			if (item?._id && Object.prototype.hasOwnProperty.call(usersByRole, item._id)) {
				usersByRole[item._id] = item.count;
			}
		}

		return {
			total: totalUsers,
			byRole: usersByRole,
		};
	}

	async getNetSales(year) {
        let currentYear;
        if (year && !isNaN(year)) currentYear = parseInt(year);
        else currentYear = new Date().getFullYear();

		const yearPrefix = `${currentYear}-`;

		const [totalResult, byPeriodeRaw] = await Promise.all([
			Transaction.aggregate([
				{
					$match: {
						type: 'LOYER',
						periode: { $regex: `^${yearPrefix}` },
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$total' },
					},
				},
			]),
			Transaction.aggregate([
				{
					$match: {
						type: 'LOYER',
						periode: { $regex: `^${yearPrefix}` },
					},
				},
				{
					$group: {
						_id: '$periode',
						total: { $sum: '$total' },
					},
				},
				{ $sort: { _id: 1 } },
			]),
		]);

		const byPeriode = byPeriodeRaw.reduce((accumulator, item) => {
			if (item?._id) {
				accumulator[item._id] = item.total;
			}
			return accumulator;
		}, {});

		return {
			year: currentYear,
			total: totalResult[0]?.total || 0,
			byPeriode,
		};
	}

	async getAdminOverview() {

		const [boxesSituation, usersSituation, netSalesSituation] = await Promise.all([
			this.getBoxesSituation(),
			this.getUsersSituation(),
			this.getNetSales(),
		]);

		return {
			boxes: boxesSituation,
			users: usersSituation,
            netSales: netSalesSituation,
		};
	}
}

module.exports = new DashboardService();
