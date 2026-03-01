/**
 * MongoDB Seed Script
 * Generates realistic test data for the e-commerce application.
 *
 * Usage: node scripts/seed.js
 *
 * Users:      admin1, boutique1, boutique2, user1, user2, user3 (password: 123456)
 * Boxes:      box1 (80k), box2 (60k), box3 (50k)
 * Boutique1:  ElectroShop → box1 depuis juillet 2025, loyer payé intégralement
 * Boutique2:  BeautyStore → box2 depuis janvier 2026, loyer payé uniquement janvier
 * Achats:     ≥10 articles/mois/utilisateur depuis août 2025
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── Models ──────────────────────────────────────────────────────────────────
const User        = require('../src/modules/users/users.model');
const Box         = require('../src/modules/boxes/box.model');
const Shop        = require('../src/modules/shops/shop.model');
const Rent        = require('../src/modules/rents/rent.model');
const ProductType = require('../src/modules/product-types/product-type.model');
const Product     = require('../src/modules/products/product.model');
const Command     = require('../src/modules/command/command.model');
const Transaction = require('../src/modules/transactions/transactions.model');
const Panier      = require('../src/modules/panier/panier.model');
const MvtStock    = require('../src/modules/mvt-stock/mvtStock.model');
const Counter     = require('../src/models/counter.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/users_db';

// ═══════════════════════════════════════════════════════════════════════════
// Fixed ObjectIds (24-hex chars) for referential integrity
// ═══════════════════════════════════════════════════════════════════════════
const USER_IDS = {
  admin1:    new mongoose.Types.ObjectId('aaa000000000000000000001'),
  boutique1: new mongoose.Types.ObjectId('aaa000000000000000000002'),
  boutique2: new mongoose.Types.ObjectId('aaa000000000000000000003'),
  user1:     new mongoose.Types.ObjectId('aaa000000000000000000004'),
  user2:     new mongoose.Types.ObjectId('aaa000000000000000000005'),
  user3:     new mongoose.Types.ObjectId('aaa000000000000000000006'),
};

const BOX_IDS = {
  box1: new mongoose.Types.ObjectId('bbb000000000000000000001'),
  box2: new mongoose.Types.ObjectId('bbb000000000000000000002'),
  box3: new mongoose.Types.ObjectId('bbb000000000000000000003'),
};

const SHOP_IDS = {
  boutique1: new mongoose.Types.ObjectId('ccc000000000000000000001'),
  boutique2: new mongoose.Types.ObjectId('ccc000000000000000000002'),
};

const RENT_IDS = {
  rent1: new mongoose.Types.ObjectId('ddd000000000000000000001'),
  rent2: new mongoose.Types.ObjectId('ddd000000000000000000002'),
};

// ── Sequential ID generators ────────────────────────────────────────────────
let pnxSeq = 0, cmdSeq = 0, mvtSeq = 0;
const nextPNX = () => `PNX-${String(++pnxSeq).padStart(5, '0')}`;
const nextCMD = () => `CMD-${String(++cmdSeq).padStart(5, '0')}`;
const nextMVT = () => `MVT-${String(++mvtSeq).padStart(5, '0')}`;

// ═══════════════════════════════════════════════════════════════════════════
// Product catalog
// ═══════════════════════════════════════════════════════════════════════════
const ELECTRONICS = [
  { _id: 'PRD-00001', name: 'Smartphone Samsung Galaxy S23', price: 1500000, attrs: { BRAND: 'Samsung', TYPE: 'Smartphone', CAPACITY: '256GB' } },
  { _id: 'PRD-00002', name: 'Smartphone iPhone 15',          price: 2000000, attrs: { BRAND: 'Apple', TYPE: 'Smartphone', CAPACITY: '128GB' } },
  { _id: 'PRD-00003', name: 'Écouteurs Bluetooth JBL',       price: 150000,  attrs: { BRAND: 'JBL', TYPE: 'Écouteurs' } },
  { _id: 'PRD-00004', name: 'Chargeur USB-C Samsung',        price: 50000,   attrs: { BRAND: 'Samsung', TYPE: 'Chargeur' } },
  { _id: 'PRD-00005', name: 'Clé USB Kingston 32GB',         price: 30000,   attrs: { BRAND: 'Kingston', TYPE: 'Stockage', CAPACITY: '32GB' } },
  { _id: 'PRD-00006', name: 'Tablette Samsung Tab A9',       price: 800000,  attrs: { BRAND: 'Samsung', TYPE: 'Tablette' } },
  { _id: 'PRD-00007', name: 'Montre connectée Xiaomi',       price: 250000,  attrs: { BRAND: 'Xiaomi', TYPE: 'Montre' } },
  { _id: 'PRD-00008', name: 'Batterie externe Anker',        price: 80000,   attrs: { BRAND: 'Anker', TYPE: 'Batterie' } },
  { _id: 'PRD-00009', name: 'Câble HDMI 2m',                 price: 25000,   attrs: { BRAND: 'Generic', TYPE: 'Câble' } },
  { _id: 'PRD-00010', name: 'Souris sans fil Logitech',      price: 60000,   attrs: { BRAND: 'Logitech', TYPE: 'Périphérique' } },
];

const COSMETICS = [
  { _id: 'PRD-00011', name: 'Crème hydratante Nivea',        price: 15000,  attrs: { BRAND: 'Nivea', TYPE: 'Soin' } },
  { _id: 'PRD-00012', name: 'Parfum Dior Sauvage 100ml',     price: 350000, attrs: { BRAND: 'Dior', TYPE: 'Parfum' } },
  { _id: 'PRD-00013', name: 'Rouge à lèvres MAC',            price: 45000,  attrs: { BRAND: 'MAC', TYPE: 'Maquillage' } },
  { _id: 'PRD-00014', name: 'Fond de teint Maybelline',      price: 30000,  attrs: { BRAND: 'Maybelline', TYPE: 'Maquillage' } },
  { _id: 'PRD-00015', name: "Shampoing L'Oréal",             price: 12000,  attrs: { BRAND: "L'Oréal", TYPE: 'Cheveux' } },
  { _id: 'PRD-00016', name: 'Gel douche Dove',               price: 8000,   attrs: { BRAND: 'Dove', TYPE: 'Hygiène' } },
  { _id: 'PRD-00017', name: 'Déodorant Nivea',               price: 10000,  attrs: { BRAND: 'Nivea', TYPE: 'Hygiène' } },
  { _id: 'PRD-00018', name: 'Crème solaire La Roche-Posay',  price: 40000,  attrs: { BRAND: 'La Roche-Posay', TYPE: 'Soin' } },
  { _id: 'PRD-00019', name: 'Sérum visage The Ordinary',     price: 25000,  attrs: { BRAND: 'The Ordinary', TYPE: 'Soin' } },
  { _id: 'PRD-00020', name: 'Masque capillaire Garnier',     price: 15000,  attrs: { BRAND: 'Garnier', TYPE: 'Cheveux' } },
];

// Sub-catalogs for everyday purchases (exclude expensive items)
const CHEAP_ELEC = ELECTRONICS.filter(p => p.price <= 250000);   // 7 items
const CHEAP_COSM = COSMETICS.filter(p => p.price <= 100000);     // 9 items

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Pick `count` distinct products from `catalog` using a deterministic seed */
function pickProducts(catalog, seed, count) {
  const n = catalog.length;
  const start = seed % n;
  const picked = [];
  const used = new Set();

  for (let i = 0; i < count && i < n; i++) {
    let idx = (start + i) % n;
    while (used.has(idx)) idx = (idx + 1) % n;
    used.add(idx);

    const p = catalog[idx];
    // ~20 % chance of qte=2, only for cheaper items
    const qte = ((seed + i) % 5 === 0 && p.price < 200000) ? 2 : 1;
    picked.push({ product: p, qte });
  }
  return picked;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connecté à MongoDB:', MONGODB_URI);

  // ── Drop all collections ──────────────────────────────────────────────
  const colls = [
    'users', 'boxes', 'shops', 'rents', 'producttypes', 'products',
    'commands', 'transactions', 'paniers', 'mvtstocks', 'counters',
  ];
  for (const c of colls) {
    try { await mongoose.connection.db.dropCollection(c); } catch (_) {}
  }
  console.log('✓ Collections supprimées');

  // ── Hash password ─────────────────────────────────────────────────────
  const hash = await bcrypt.hash('123456', 10);
  console.log('✓ Mot de passe hashé (bcrypt)');

  // ═══════════ BOXES ═══════════════════════════════════════════════════
  await Box.insertMany([
    {
      _id: BOX_IDS.box1, label: 'Box 1', state: 'RENTED', rent: 80000,
      createdAt: new Date('2025-06-01'), updatedAt: new Date('2025-07-01'),
    },
    {
      _id: BOX_IDS.box2, label: 'Box 2', state: 'RENTED', rent: 60000,
      createdAt: new Date('2025-06-01'), updatedAt: new Date('2026-01-01'),
    },
    {
      _id: BOX_IDS.box3, label: 'Box 3', state: 'AVAILABLE', rent: 50000,
      createdAt: new Date('2025-06-01'), updatedAt: new Date('2025-06-01'),
    },
  ]);
  console.log('✓ 3 boxes');

  // ═══════════ SHOPS ══════════════════════════════════════════════════
  await Shop.insertMany([
    {
      _id: SHOP_IDS.boutique1, name: 'ElectroShop', status: 'ACTIVE',
      ownerUserId: USER_IDS.boutique1, boxId: BOX_IDS.box1,
      createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-07-01'),
    },
    {
      _id: SHOP_IDS.boutique2, name: 'BeautyStore', status: 'ACTIVE',
      ownerUserId: USER_IDS.boutique2, boxId: BOX_IDS.box2,
      createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    },
  ]);
  console.log('✓ 2 boutiques');

  // ═══════════ PRODUCT TYPES ══════════════════════════════════════════
  await ProductType.insertMany([
    {
      _id: 'PT-00001', label: 'Électronique',
      attributes: [
        { code: 'BRAND', type: 'ENUM', values: ['Samsung', 'Apple', 'JBL', 'Kingston', 'Xiaomi', 'Anker', 'Generic', 'Logitech'] },
        { code: 'TYPE', type: 'ENUM', values: ['Smartphone', 'Écouteurs', 'Chargeur', 'Stockage', 'Tablette', 'Montre', 'Batterie', 'Câble', 'Périphérique'] },
        { code: 'CAPACITY', type: 'ENUM', values: ['32GB', '64GB', '128GB', '256GB', '512GB'] },
      ],
      createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-07-01'),
    },
    {
      _id: 'PT-00002', label: 'Cosmétique',
      attributes: [
        { code: 'BRAND', type: 'ENUM', values: ['Nivea', 'Dior', 'MAC', 'Maybelline', "L'Oréal", 'Dove', 'La Roche-Posay', 'The Ordinary', 'Garnier'] },
        { code: 'TYPE', type: 'ENUM', values: ['Soin', 'Parfum', 'Maquillage', 'Cheveux', 'Hygiène'] },
      ],
      createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-07-01'),
    },
  ]);
  console.log('✓ 2 types de produits');

  // ═══════════ PRODUCTS ═══════════════════════════════════════════════
  const stockTracker = {}; // productId → total sold
  const productDocs = [];

  for (const p of ELECTRONICS) {
    stockTracker[p._id] = 0;
    productDocs.push({
      _id: p._id, name: p.name, price: p.price,
      productTypeId: 'PT-00001',
      shop: { _id: SHOP_IDS.boutique1.toString(), name: 'ElectroShop' },
      attributes: p.attrs, stock: 100,
      promotion: { active: false }, status: 'ACTIVE',
      photoUrl: null, photoPath: null,
      createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-07-01'),
    });
  }
  for (const p of COSMETICS) {
    stockTracker[p._id] = 0;
    productDocs.push({
      _id: p._id, name: p.name, price: p.price,
      productTypeId: 'PT-00002',
      shop: { _id: SHOP_IDS.boutique2.toString(), name: 'BeautyStore' },
      attributes: p.attrs, stock: 200,
      promotion: { active: false }, status: 'ACTIVE',
      photoUrl: null, photoPath: null,
      createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    });
  }
  await Product.insertMany(productDocs);
  console.log(`✓ ${productDocs.length} produits`);

  // ═══════════ RENTS ══════════════════════════════════════════════════
  await Rent.insertMany([
    {
      _id: RENT_IDS.rent1,
      boxId: BOX_IDS.box1, shopId: SHOP_IDS.boutique1,
      startDate: new Date('2025-07-01'),
      nextDeadline: new Date('2026-03-01'), // payé jusqu'à fév 2026 inclus
      status: 'ACTIVE', amount: 80000, frequency: 'MONTHLY',
    },
    {
      _id: RENT_IDS.rent2,
      boxId: BOX_IDS.box2, shopId: SHOP_IDS.boutique2,
      startDate: new Date('2026-01-01'),
      nextDeadline: new Date('2026-02-01'), // seul janvier payé → en retard sur février
      status: 'ACTIVE', amount: 60000, frequency: 'MONTHLY',
    },
  ]);
  console.log('✓ 2 locations');

  // ═══════════ LOYER TRANSACTIONS ═════════════════════════════════════
  const loyerTx = [];

  // boutique1 : juillet 2025 → février 2026 (8 mois, tout payé)
  for (const p of ['2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02']) {
    const [y, m] = p.split('-').map(Number);
    loyerTx.push({
      type: 'LOYER', total: 80000,
      date: new Date(y, m - 1, 1),
      userId: USER_IDS.boutique1,
      rentId: RENT_IDS.rent1,
      periode: p,
    });
  }

  // boutique2 : janvier 2026 uniquement
  loyerTx.push({
    type: 'LOYER', total: 60000,
    date: new Date(2026, 0, 1),
    userId: USER_IDS.boutique2,
    rentId: RENT_IDS.rent2,
    periode: '2026-01',
  });

  await Transaction.insertMany(loyerTx);
  console.log(`✓ ${loyerTx.length} transactions loyer`);

  // ═══════════ GENERATE PURCHASES ═════════════════════════════════════
  // Months: Aug 2025 → Feb 2026 (7 mois)
  const months = [
    { y: 2025, m: 7  }, // Août
    { y: 2025, m: 8  }, // Sep
    { y: 2025, m: 9  }, // Oct
    { y: 2025, m: 10 }, // Nov
    { y: 2025, m: 11 }, // Déc
    { y: 2026, m: 0  }, // Jan
    { y: 2026, m: 1  }, // Fév
  ];

  const buyers = [
    { key: 'user1', name: 'Andry Rakoto',       days: [5, 18] },
    { key: 'user2', name: 'Faly Randria',        days: [8, 22] },
    { key: 'user3', name: 'Hery Rabemananjara',  days: [12, 26] },
  ];

  const totalSpent = { user1: 0, user2: 0, user3: 0 };
  const panierDocs = [], cmdDocs = [], achatTx = [], mvtDocs = [];

  for (let mi = 0; mi < months.length; mi++) {
    const { y, m } = months[mi];
    const hasCosmetics = mi >= 5; // boutique2 active à partir de jan 2026

    for (let bi = 0; bi < buyers.length; bi++) {
      const b = buyers[bi];
      const uid = USER_IDS[b.key];

      // ── Panier 1 : Électronique (boutique1) ──────────────────────────
      const seed1 = mi * 3 + bi;
      const picks1 = pickProducts(CHEAP_ELEC, seed1, 5);

      const panierItems1 = picks1.map(({ product: p, qte }) => ({
        productId: p._id, name: p.name, price: p.price, qte,
        shop: { _id: SHOP_IDS.boutique1.toString(), name: 'ElectroShop' },
      }));
      const total1 = panierItems1.reduce((s, i) => s + i.price * i.qte, 0);

      const pid1 = nextPNX();
      const tid1 = new mongoose.Types.ObjectId();
      const cid1 = nextCMD();
      const d1 = new Date(y, m, b.days[0], 10, 0, 0);

      panierDocs.push({
        _id: pid1, acheteurId: uid.toString(), items: panierItems1,
        total: total1, date: d1, etat: 'VALIDATED', createdAt: d1, updatedAt: d1,
      });

      cmdDocs.push({
        _id: cid1,
        acheteur: { _id: uid.toString(), name: b.name },
        boutique: { _id: SHOP_IDS.boutique1.toString(), name: 'ElectroShop' },
        transactionId: tid1.toString(),
        items: picks1.map(({ product: p, qte }) => ({
          produit: { _id: p._id, name: p.name, price: p.price, qte },
        })),
        totalAmount: total1,
        totalItems: picks1.reduce((s, i) => s + i.qte, 0),
        createdAt: d1, updatedAt: d1,
      });

      achatTx.push({
        _id: tid1, type: 'ACHAT', total: total1,
        date: d1, userId: uid, panierId: pid1,
      });

      for (const { product: p, qte } of picks1) {
        stockTracker[p._id] += qte;
        mvtDocs.push({
          _id: nextMVT(), produitId: p._id, qte,
          reason: 'VENTE', createdAt: d1, updatedAt: d1,
        });
      }

      totalSpent[b.key] += total1;

      // ── Panier 2 : Cosmétique (jan+) ou Électronique (août-déc) ─────
      const seed2 = mi * 3 + bi + 11; // offset pour varier la sélection
      let picks2, shopRef;

      if (hasCosmetics) {
        picks2 = pickProducts(CHEAP_COSM, seed2, 6);
        shopRef = { _id: SHOP_IDS.boutique2.toString(), name: 'BeautyStore' };
      } else {
        picks2 = pickProducts(CHEAP_ELEC, seed2, 6);
        shopRef = { _id: SHOP_IDS.boutique1.toString(), name: 'ElectroShop' };
      }

      const panierItems2 = picks2.map(({ product: p, qte }) => ({
        productId: p._id, name: p.name, price: p.price, qte,
        shop: shopRef,
      }));
      const total2 = panierItems2.reduce((s, i) => s + i.price * i.qte, 0);

      const pid2 = nextPNX();
      const tid2 = new mongoose.Types.ObjectId();
      const cid2 = nextCMD();
      const d2 = new Date(y, m, b.days[1], 14, 30, 0);

      panierDocs.push({
        _id: pid2, acheteurId: uid.toString(), items: panierItems2,
        total: total2, date: d2, etat: 'VALIDATED', createdAt: d2, updatedAt: d2,
      });

      cmdDocs.push({
        _id: cid2,
        acheteur: { _id: uid.toString(), name: b.name },
        boutique: shopRef,
        transactionId: tid2.toString(),
        items: picks2.map(({ product: p, qte }) => ({
          produit: { _id: p._id, name: p.name, price: p.price, qte },
        })),
        totalAmount: total2,
        totalItems: picks2.reduce((s, i) => s + i.qte, 0),
        createdAt: d2, updatedAt: d2,
      });

      achatTx.push({
        _id: tid2, type: 'ACHAT', total: total2,
        date: d2, userId: uid, panierId: pid2,
      });

      for (const { product: p, qte } of picks2) {
        stockTracker[p._id] += qte;
        mvtDocs.push({
          _id: nextMVT(), produitId: p._id, qte,
          reason: 'VENTE', createdAt: d2, updatedAt: d2,
        });
      }

      totalSpent[b.key] += total2;
    }
  }

  await Panier.insertMany(panierDocs);
  await Command.insertMany(cmdDocs);
  await Transaction.insertMany(achatTx);
  await MvtStock.insertMany(mvtDocs);
  console.log(`✓ ${panierDocs.length} paniers, ${cmdDocs.length} commandes, ${achatTx.length} tx achat, ${mvtDocs.length} mvt stock`);

  // ═══════════ RECHARGE TRANSACTIONS ══════════════════════════════════
  // Compute recharges so that solde ≈ 15 % of total spent (remainder)
  const rechargeTx = [];
  const userSoldes = {};

  for (const key of ['user1', 'user2', 'user3']) {
    const spent = totalSpent[key];
    const remainder = Math.ceil(spent * 0.15 / 1000) * 1000; // ~15 %, arrondi au millier
    const totalRecharge = spent + remainder;
    const r1 = Math.round(totalRecharge * 0.6 / 1000) * 1000;
    const r2 = totalRecharge - r1;

    rechargeTx.push(
      { type: 'RECHARGE', total: r1, date: new Date('2025-08-01'), userId: USER_IDS[key] },
      { type: 'RECHARGE', total: r2, date: new Date('2025-12-01'), userId: USER_IDS[key] },
    );
    userSoldes[key] = remainder;
  }

  // Boutique owners : recharges covering rent
  rechargeTx.push(
    { type: 'RECHARGE', total: 1000000, date: new Date('2025-07-01'), userId: USER_IDS.boutique1 },
    { type: 'RECHARGE', total: 200000,  date: new Date('2026-01-01'), userId: USER_IDS.boutique2 },
  );
  userSoldes.boutique1 = 1000000 - (80000 * 8); // 360 000
  userSoldes.boutique2 = 200000 - 60000;          // 140 000
  userSoldes.admin1 = 0;

  await Transaction.insertMany(rechargeTx);
  console.log(`✓ ${rechargeTx.length} transactions recharge`);

  // ═══════════ USERS ══════════════════════════════════════════════════
  await User.insertMany([
    {
      _id: USER_IDS.admin1, role: 'ADMIN', login: 'admin1', password: hash,
      profile: { fullName: 'Administrateur Principal', tel: '0340000001', solde: 0 },
      status: 'ACTIVE',
      createdAt: new Date('2025-06-01'), updatedAt: new Date('2025-06-01'),
    },
    {
      _id: USER_IDS.boutique1, role: 'BOUTIQUE', login: 'boutique1', password: hash,
      profile: { fullName: 'Rakoto Jean', tel: '0340000002', solde: userSoldes.boutique1, email: 'rakoto@email.com' },
      status: 'ACTIVE',
      createdAt: new Date('2025-06-15'), updatedAt: new Date('2025-06-15'),
    },
    {
      _id: USER_IDS.boutique2, role: 'BOUTIQUE', login: 'boutique2', password: hash,
      profile: { fullName: 'Rasoa Marie', tel: '0340000003', solde: userSoldes.boutique2, email: 'rasoa@email.com' },
      status: 'ACTIVE',
      createdAt: new Date('2025-12-15'), updatedAt: new Date('2025-12-15'),
    },
    {
      _id: USER_IDS.user1, role: 'ACHETEUR', login: 'user1', password: hash,
      profile: { fullName: 'Andry Rakoto', tel: '0340000004', solde: userSoldes.user1 },
      status: 'ACTIVE',
      createdAt: new Date('2025-07-15'), updatedAt: new Date('2025-07-15'),
    },
    {
      _id: USER_IDS.user2, role: 'ACHETEUR', login: 'user2', password: hash,
      profile: { fullName: 'Faly Randria', tel: '0340000005', solde: userSoldes.user2, email: 'faly@email.com' },
      status: 'ACTIVE',
      createdAt: new Date('2025-07-20'), updatedAt: new Date('2025-07-20'),
    },
    {
      _id: USER_IDS.user3, role: 'ACHETEUR', login: 'user3', password: hash,
      profile: { fullName: 'Hery Rabemananjara', tel: '0340000006', solde: userSoldes.user3 },
      status: 'ACTIVE',
      createdAt: new Date('2025-08-01'), updatedAt: new Date('2025-08-01'),
    },
  ]);
  console.log('✓ 6 utilisateurs');

  // ═══════════ UPDATE PRODUCT STOCK ═══════════════════════════════════
  for (const [pid, sold] of Object.entries(stockTracker)) {
    if (sold > 0) {
      const initial = pid <= 'PRD-00010' ? 100 : 200;
      await Product.updateOne({ _id: pid }, { stock: initial - sold });
    }
  }
  console.log('✓ Stock produits mis à jour');

  // ═══════════ COUNTERS ═══════════════════════════════════════════════
  await Counter.insertMany([
    { _id: 'PRD', sequence: 20 },
    { _id: 'PT',  sequence: 2 },
    { _id: 'PNX', sequence: pnxSeq },
    { _id: 'CMD', sequence: cmdSeq },
    { _id: 'MVT', sequence: mvtSeq },
  ]);
  console.log('✓ Compteurs initialisés');

  // ═══════════ SUMMARY ═══════════════════════════════════════════════
  const totalTx = loyerTx.length + rechargeTx.length + achatTx.length;
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SEED TERMINÉ AVEC SUCCÈS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Users .............. 6`);
  console.log(`  Boxes .............. 3`);
  console.log(`  Shops .............. 2`);
  console.log(`  ProductTypes ....... 2`);
  console.log(`  Products ........... ${productDocs.length}`);
  console.log(`  Rents .............. 2`);
  console.log(`  Paniers ............ ${panierDocs.length}`);
  console.log(`  Commandes .......... ${cmdDocs.length}`);
  console.log(`  Transactions ....... ${totalTx} (${loyerTx.length} loyer + ${rechargeTx.length} recharge + ${achatTx.length} achat)`);
  console.log(`  MvtStock ........... ${mvtDocs.length}`);
  console.log(`  Counters ........... 5`);
  console.log('');
  console.log('  Soldes utilisateurs :');
  for (const [k, v] of Object.entries(userSoldes)) {
    console.log(`    ${k.padEnd(12)} ${v.toLocaleString('fr-FR')} Ar`);
  }
  console.log('');
  console.log('  Total dépensé (achats) :');
  for (const [k, v] of Object.entries(totalSpent)) {
    console.log(`    ${k.padEnd(12)} ${v.toLocaleString('fr-FR')} Ar`);
  }
  console.log('');
  console.log('  Stock vendu par produit :');
  for (const [pid, sold] of Object.entries(stockTracker)) {
    if (sold > 0) console.log(`    ${pid}  -${sold}`);
  }
  console.log('═══════════════════════════════════════════════════════════');

  await mongoose.disconnect();
  console.log('\n✓ Déconnecté de MongoDB');
}

seed().catch(err => {
  console.error('❌ Erreur seed:', err);
  mongoose.disconnect();
  process.exit(1);
});
