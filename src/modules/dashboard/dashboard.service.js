const Box = require('../boxes/box.model');
const User = require('../users/users.model');
const Transaction = require('../transactions/transactions.model');

class DashboardService {
	async getAdminBoxesSituation() {
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

	async getAdminUsersSituation() {
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

	async getAdminNetSales(year) {
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

	async getBoutiqueTotalUsersWithPurchase() {
		const uniqueBuyers = await Transaction.distinct('userId', {
			type: 'ACHAT',
		});

		return {
			total: uniqueBuyers.length,
		};
	}

	async getBoutiqueMonthlyCustomers(year) {
		let selectedYear;
		if (year && !isNaN(year)) selectedYear = parseInt(year, 10);
		else selectedYear = new Date().getFullYear();

		const yearStart = new Date(selectedYear, 0, 1);
		const nextYearStart = new Date(selectedYear + 1, 0, 1);

		const monthlyRaw = await Transaction.aggregate([
			{
				$match: {
					type: 'ACHAT',
					date: { $gte: yearStart, $lt: nextYearStart },
				},
			},
			{
				$group: {
					_id: { $month: '$date' },
					users: { $addToSet: '$userId' },
				},
			},
			{
				$project: {
					_id: 1,
					total: { $size: '$users' },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const byMonth = {};
		for (let month = 1; month <= 12; month += 1) {
			const monthKey = `${selectedYear}-${String(month).padStart(2, '0')}`;
			byMonth[monthKey] = 0;
		}

		for (const item of monthlyRaw) {
			const monthKey = `${selectedYear}-${String(item._id).padStart(2, '0')}`;
			if (Object.prototype.hasOwnProperty.call(byMonth, monthKey)) {
				byMonth[monthKey] = item.total;
			}
		}

		return {
			year: selectedYear,
			byMonth,
		};
	}

    async getBoutiqueCustomersSituation() {
        const [totalCustomers, monthlyCustomers] = await Promise.all([
            this.getBoutiqueTotalUsersWithPurchase(),
            this.getBoutiqueMonthlyCustomers(),
        ]);
        return {
            total: totalCustomers.total,
            byMonth: monthlyCustomers.byMonth
        };
    }

	async getAdminOverview() {

		const [boxesSituation, usersSituation, netSalesSituation] = await Promise.all([
			this.getAdminBoxesSituation(),
			this.getAdminUsersSituation(),
			this.getAdminNetSales(),
		]);

		return {
			boxes: boxesSituation,
			users: usersSituation,
            netSales: netSalesSituation,
		};
	}


    async getBoutiqueOverview() {
        const [customers] = await Promise.all([
            this.getBoutiqueCustomersSituation(),
        ]);
        return {
            customers,
        };
    }
}

module.exports = new DashboardService();
