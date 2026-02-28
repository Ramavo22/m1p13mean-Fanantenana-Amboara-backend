const boxRepository = require('../boxes/box.repository');
const userRepository = require('../users/user.repository');
const transactionRepository = require('../transactions/transaction.repository');
const commandRepository = require('../command/command.repository');
const shopRepository = require('../shops/shop.repository');

class DashboardService {

	async getAdminBoxesSituation() {
		const boxStates = ['AVAILABLE', 'RENTED'];

		const { total, byStateRaw } = await boxRepository.countSituation();

		const byState = boxStates.reduce((accumulator, state) => {
			accumulator[state] = 0;
			return accumulator;
		}, {});

		for (const item of byStateRaw) {
			if (item?._id && Object.prototype.hasOwnProperty.call(byState, item._id)) {
				byState[item._id] = item.count;
			}
		}

		return {
			total,
			byState,
		};
	}

	async getAdminUsersSituation() {
		const userRoles = ['ADMIN', 'BOUTIQUE', 'ACHETEUR'];

		const { total, byRoleRaw } = await userRepository.countSituation();

		const byRole = userRoles.reduce((accumulator, role) => {
			accumulator[role] = 0;
			return accumulator;
		}, {});

		for (const item of byRoleRaw) {
			if (item?._id && Object.prototype.hasOwnProperty.call(byRole, item._id)) {
				byRole[item._id] = item.count;
			}
		}

		return {
			total,
			byRole,
		};
	}

	async getAdminNetSales(year) {
		let currentYear;
		if (year && !isNaN(year)) currentYear = parseInt(year);
		else currentYear = new Date().getFullYear();

		const { total, byPeriodeRaw } = await transactionRepository.sumLoyerByYear(currentYear);

		const byPeriode = byPeriodeRaw.reduce((accumulator, item) => {
			if (item?._id) {
				accumulator[item._id] = item.total;
			}
			return accumulator;
		}, {});

		return {
			year: currentYear,
			total,
			byPeriode,
		};
	}

	async getBoutiqueTotalUsersWithPurchase(boutiqueId) {
		const total = await commandRepository.getDistinctBuyersByBoutique(boutiqueId);
		return { total };
	}

	async getBoutiqueMonthlyCustomers(boutiqueId, year) {
		let selectedYear;
		if (year && !isNaN(year)) selectedYear = parseInt(year, 10);
		else selectedYear = new Date().getFullYear();

		const monthlyRaw = await commandRepository.getMonthlyCustomersByBoutique(boutiqueId, selectedYear);

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

	async getBoutiqueCustomersSituation(boutiqueId, year) {
		const [totalCustomers, monthlyCustomers] = await Promise.all([
			this.getBoutiqueTotalUsersWithPurchase(boutiqueId),
			this.getBoutiqueMonthlyCustomers(boutiqueId, year),
		]);
		return {
			total: totalCustomers.total,
			byMonth: monthlyCustomers.byMonth,
		};
	}

	async getBoutiqueNetSales(boutiqueId, year) {
		let selectedYear;
		if (year && !isNaN(year)) selectedYear = parseInt(year, 10);
		else selectedYear = new Date().getFullYear();

		const { total, byMonthRaw } = await commandRepository.sumNetSalesByBoutiqueAndYear(boutiqueId, selectedYear);

		const byMonth = {};
		for (let month = 1; month <= 12; month += 1) {
			const monthKey = `${selectedYear}-${String(month).padStart(2, '0')}`;
			byMonth[monthKey] = 0;
		}

		for (const item of byMonthRaw) {
			const monthKey = `${selectedYear}-${String(item._id).padStart(2, '0')}`;
			if (Object.prototype.hasOwnProperty.call(byMonth, monthKey)) {
				byMonth[monthKey] = item.total;
			}
		}

		return {
			year: selectedYear,
			total,
			byMonth,
		};
	}

	async getBoutiqueNetSalesToday(boutiqueId) {
		return commandRepository.sumNetSalesTodayByBoutique(boutiqueId);
	}

	async getBoutiqueOverview(userId, year) {
		const shop = await shopRepository.findByOwnerUserId(userId);
		if (!shop || shop.length === 0) {
			throw new Error('Aucune boutique trouvée pour cet utilisateur');
		}

		const boutiqueId = shop[0]._id.toString();
		const [customers, netSales] = await Promise.all([
			this.getBoutiqueCustomersSituation(boutiqueId, year),
			this.getBoutiqueNetSales(boutiqueId, year),
		]);

		return {
			customers,
			netSales,
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
}

module.exports = new DashboardService();
