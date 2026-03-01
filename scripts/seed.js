/**
 * Seed script — données de test
 * Usage : node scripts/seed.js
 *
 * Crée (en remplaçant) :
 *  - 1 ADMIN
 *  - 3 BOUTIQUE (Smartphone, Vêtement, Restauration)
 *  - 6 Boxes
 *  - 3 ProductTypes avec attributs
 *  - 3 Shops liés aux users/boxes
 *  - 10 Products par boutique (30 au total)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/database');

// ── Modèles ──────────────────────────────────────────────────────────────────
const User        = require('../src/modules/users/users.model');
const Box         = require('../src/modules/boxes/box.model');
const ProductType = require('../src/modules/product-types/product-type.model');
const Shop        = require('../src/modules/shops/shop.model');
const Product     = require('../src/modules/products/product.model');
const Counter     = require('../src/models/counter.model');

// ── Helpers ───────────────────────────────────────────────────────────────────
const hash = (pwd) => bcrypt.hash(pwd, 10);

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await connectDB();

  console.log('\n🗑  Nettoyage des collections...');
  await Promise.all([
    User.deleteMany({ login: { $in: ['admin_seed', 'boutique_tech', 'boutique_fashion', 'boutique_resto'] } }),
    Box.deleteMany({ label: { $regex: /^BOX-SEED/ } }),
    ProductType.deleteMany({ _id: { $in: ['PT-00001', 'PT-00002', 'PT-00003'] } }),
  ]);

  // Supprimer les shops/products liés aux labels seed (si re-run)
  await Shop.deleteMany({ name: { $in: ['TechShop', 'FashionShop', 'BonAppétit'] } });
  await Product.deleteMany({ _id: { $regex: /^PRD-SEED/ } });

  // ── 1. USERS ────────────────────────────────────────────────────────────────
  console.log('\n👤 Création des utilisateurs...');
  const [adminUser, techUser, fashionUser, restoUser] = await User.insertMany([
    {
      role: 'ADMIN',
      login: 'admin_seed',
      password: await hash('Admin1234'),
      profile: { fullName: 'Super Admin', tel: '0300000000', email: 'admin@seed.mg', solde: 0 },
      status: 'ACTIVE',
    },
    {
      role: 'BOUTIQUE',
      login: 'boutique_tech',
      password: await hash('Password123'),
      profile: { fullName: 'Jean Rakoto', tel: '0321111111', email: 'tech@seed.mg', solde: 500 },
      status: 'ACTIVE',
    },
    {
      role: 'BOUTIQUE',
      login: 'boutique_fashion',
      password: await hash('Password123'),
      profile: { fullName: 'Marie Rabe', tel: '0332222222', email: 'fashion@seed.mg', solde: 500 },
      status: 'ACTIVE',
    },
    {
      role: 'BOUTIQUE',
      login: 'boutique_resto',
      password: await hash('Password123'),
      profile: { fullName: 'Paul Andria', tel: '0343333333', email: 'resto@seed.mg', solde: 500 },
      status: 'ACTIVE',
    },
  ]);
  console.log(`   ✓ ${[adminUser, techUser, fashionUser, restoUser].length} utilisateurs créés`);

  // ── 2. BOXES ─────────────────────────────────────────────────────────────────
  console.log('\n📦 Création des boxes...');
  const boxes = await Box.insertMany([
    { label: 'BOX-SEED-A01', state: 'RENTED',    rent: 150000 },
    { label: 'BOX-SEED-A02', state: 'RENTED',    rent: 150000 },
    { label: 'BOX-SEED-A03', state: 'RENTED',    rent: 200000 },
    { label: 'BOX-SEED-B01', state: 'AVAILABLE', rent: 120000 },
    { label: 'BOX-SEED-B02', state: 'AVAILABLE', rent: 130000 },
    { label: 'BOX-SEED-B03', state: 'REPAIR',    rent: 100000 },
  ]);
  const [boxTech, boxFashion, boxResto] = boxes;
  console.log(`   ✓ ${boxes.length} boxes créées`);

  // ── 3. PRODUCT TYPES ─────────────────────────────────────────────────────────
  console.log('\n🏷  Création des types de produits...');
  const [ptSmartphone, ptVetement, ptRestauration] = await ProductType.insertMany([
    {
      _id: 'PT-00001',
      label: 'Smartphone',
      attributes: [
        { code: 'BRAND',   type: 'ENUM',   values: ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Tecno'] },
        { code: 'STORAGE', type: 'ENUM',   values: ['64GB', '128GB', '256GB', '512GB'] },
        { code: 'RAM',     type: 'ENUM',   values: ['4GB', '6GB', '8GB', '12GB'] },
        { code: 'COLOR',   type: 'ENUM',   values: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert'] },
        { code: 'SCREEN',  type: 'NUMBER', min: 4, max: 7 },
      ],
    },
    {
      _id: 'PT-00002',
      label: 'Vêtement',
      attributes: [
        { code: 'BRAND',    type: 'STRING', values: [] },
        { code: 'SIZE',     type: 'ENUM',   values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { code: 'COLOR',    type: 'ENUM',   values: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune'] },
        { code: 'MATERIAL', type: 'STRING', values: [] },
        { code: 'GENDER',   type: 'ENUM',   values: ['Homme', 'Femme', 'Unisexe', 'Enfant'] },
      ],
    },
    {
      _id: 'PT-00003',
      label: 'Restauration',
      attributes: [
        { code: 'CATEGORY',  type: 'ENUM',   values: ['Plat', 'Entrée', 'Dessert', 'Boisson', 'Snack'] },
        { code: 'ALLERGENES', type: 'STRING', values: [] },
        { code: 'CALORIES',  type: 'NUMBER', min: 0, max: 5000 },
        { code: 'VEGETARIEN', type: 'BOOLEAN', values: [] },
      ],
    },
  ]);
  console.log(`   ✓ 3 types créés (${ptSmartphone._id}, ${ptVetement._id}, ${ptRestauration._id})`);

  // Sync counters pour ne pas entrer en conflit avec les IDs séquentiels
  await Counter.findByIdAndUpdate('PT',  { sequence: 3 }, { upsert: true });
  await Counter.findByIdAndUpdate('PRD', { sequence: 30 }, { upsert: true });

  // ── 4. SHOPS ─────────────────────────────────────────────────────────────────
  console.log('\n🏪 Création des boutiques...');
  const [shopTech, shopFashion, shopResto] = await Shop.insertMany([
    { name: 'TechShop',    status: 'ACTIVE', ownerUserId: techUser._id,    boxId: boxTech._id },
    { name: 'FashionShop', status: 'ACTIVE', ownerUserId: fashionUser._id, boxId: boxFashion._id },
    { name: 'BonAppétit',  status: 'ACTIVE', ownerUserId: restoUser._id,   boxId: boxResto._id },
  ]);
  console.log(`   ✓ 3 boutiques créées`);

  const shopTechRef    = { _id: shopTech._id.toString(),    name: 'TechShop' };
  const shopFashionRef = { _id: shopFashion._id.toString(), name: 'FashionShop' };
  const shopRestoRef   = { _id: shopResto._id.toString(),   name: 'BonAppétit' };

  // ── 5. PRODUITS ───────────────────────────────────────────────────────────────
  console.log('\n📱👗🍽  Création des produits...');

  // --- Smartphone (10) ---
  const smartphoneProducts = [
    { _id: 'PRD-SEED-001', name: 'Samsung Galaxy A54',     price: 899000,  stock: 15, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Samsung', STORAGE: '128GB', RAM: '8GB',  COLOR: 'Noir',  SCREEN: 6.4 } },
    { _id: 'PRD-SEED-002', name: 'iPhone 14',              price: 2499000, stock: 8,  productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Apple',   STORAGE: '128GB', RAM: '6GB',  COLOR: 'Blanc', SCREEN: 6.1 } },
    { _id: 'PRD-SEED-003', name: 'Xiaomi Redmi Note 12',   price: 499000,  stock: 20, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Xiaomi',  STORAGE: '128GB', RAM: '6GB',  COLOR: 'Bleu',  SCREEN: 6.67 } },
    { _id: 'PRD-SEED-004', name: 'Samsung Galaxy S23',     price: 1799000, stock: 5,  productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Samsung', STORAGE: '256GB', RAM: '8GB',  COLOR: 'Noir',  SCREEN: 6.1 } },
    { _id: 'PRD-SEED-005', name: 'Oppo Reno 8',            price: 699000,  stock: 12, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Oppo',    STORAGE: '128GB', RAM: '8GB',  COLOR: 'Vert',  SCREEN: 6.4 } },
    { _id: 'PRD-SEED-006', name: 'Tecno Spark 20',         price: 299000,  stock: 30, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Tecno',   STORAGE: '128GB', RAM: '4GB',  COLOR: 'Blanc', SCREEN: 6.6 } },
    { _id: 'PRD-SEED-007', name: 'iPhone 13',              price: 1999000, stock: 6,  productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Apple',   STORAGE: '256GB', RAM: '6GB',  COLOR: 'Noir',  SCREEN: 6.1 } },
    { _id: 'PRD-SEED-008', name: 'Xiaomi POCO X5 Pro',     price: 549000,  stock: 18, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Xiaomi',  STORAGE: '256GB', RAM: '8GB',  COLOR: 'Noir',  SCREEN: 6.67 } },
    { _id: 'PRD-SEED-009', name: 'Samsung Galaxy A14',     price: 349000,  stock: 25, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Samsung', STORAGE: '64GB',  RAM: '4GB',  COLOR: 'Bleu',  SCREEN: 6.6 } },
    { _id: 'PRD-SEED-010', name: 'Oppo A78',               price: 449000,  stock: 14, productTypeId: 'PT-00001', shop: shopTechRef, attributes: { BRAND: 'Oppo',    STORAGE: '128GB', RAM: '4GB',  COLOR: 'Rouge', SCREEN: 6.43 } },
  ];

  // --- Vêtement (10) ---
  const vetementProducts = [
    { _id: 'PRD-SEED-011', name: 'T-Shirt Nike Homme',       price: 85000,  stock: 50, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Nike',    SIZE: 'M',   COLOR: 'Blanc',  MATERIAL: 'Coton',    GENDER: 'Homme' } },
    { _id: 'PRD-SEED-012', name: 'Jean Slim Femme',           price: 120000, stock: 35, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Zara',    SIZE: 'S',   COLOR: 'Bleu',   MATERIAL: 'Denim',    GENDER: 'Femme' } },
    { _id: 'PRD-SEED-013', name: 'Hoodie Adidas Unisexe',     price: 145000, stock: 28, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Adidas',  SIZE: 'L',   COLOR: 'Noir',   MATERIAL: 'Polyester', GENDER: 'Unisexe' } },
    { _id: 'PRD-SEED-014', name: 'Robe d\'été Femme',         price: 95000,  stock: 40, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'H&M',    SIZE: 'M',   COLOR: 'Rouge',  MATERIAL: 'Lin',      GENDER: 'Femme' } },
    { _id: 'PRD-SEED-015', name: 'Veste en Cuir Homme',       price: 280000, stock: 10, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Zara',    SIZE: 'XL',  COLOR: 'Noir',   MATERIAL: 'Cuir',     GENDER: 'Homme' } },
    { _id: 'PRD-SEED-016', name: 'Polo Lacoste Homme',        price: 175000, stock: 22, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Lacoste', SIZE: 'L',   COLOR: 'Blanc',  MATERIAL: 'Coton',    GENDER: 'Homme' } },
    { _id: 'PRD-SEED-017', name: 'Legging Sport Femme',       price: 65000,  stock: 60, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Nike',    SIZE: 'S',   COLOR: 'Noir',   MATERIAL: 'Elasthane', GENDER: 'Femme' } },
    { _id: 'PRD-SEED-018', name: 'Short Bermuda Homme',       price: 75000,  stock: 45, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'H&M',    SIZE: 'M',   COLOR: 'Gris',   MATERIAL: 'Coton',    GENDER: 'Homme' } },
    { _id: 'PRD-SEED-019', name: 'Manteau Hiver Femme',       price: 320000, stock: 8,  productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Zara',    SIZE: 'XS',  COLOR: 'Gris',   MATERIAL: 'Laine',    GENDER: 'Femme' } },
    { _id: 'PRD-SEED-020', name: 'Ensemble Jogging Enfant',   price: 55000,  stock: 70, productTypeId: 'PT-00002', shop: shopFashionRef, attributes: { BRAND: 'Adidas',  SIZE: 'S',   COLOR: 'Bleu',   MATERIAL: 'Coton',    GENDER: 'Enfant' } },
  ];

  // --- Restauration (10) ---
  const restoProducts = [
    { _id: 'PRD-SEED-021', name: 'Romazava',             price: 12000, stock: 100, productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Plat',     ALLERGENES: 'Viande',       CALORIES: 450, VEGETARIEN: false } },
    { _id: 'PRD-SEED-022', name: 'Ravitoto sy Henakisoa', price: 14000, stock: 80,  productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Plat',     ALLERGENES: 'Porc',         CALORIES: 520, VEGETARIEN: false } },
    { _id: 'PRD-SEED-023', name: 'Mofo Gasy',            price: 3000,  stock: 200, productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Snack',    ALLERGENES: 'Gluten',       CALORIES: 180, VEGETARIEN: true  } },
    { _id: 'PRD-SEED-024', name: 'Lasopy Legumes',       price: 8000,  stock: 60,  productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Entrée',   ALLERGENES: 'Aucun',        CALORIES: 90,  VEGETARIEN: true  } },
    { _id: 'PRD-SEED-025', name: 'Riz Cantonnais',       price: 15000, stock: 90,  productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Plat',     ALLERGENES: 'Oeuf/Soja',    CALORIES: 480, VEGETARIEN: false } },
    { _id: 'PRD-SEED-026', name: 'Jus de Corossol',      price: 5000,  stock: 150, productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Boisson',  ALLERGENES: 'Aucun',        CALORIES: 95,  VEGETARIEN: true  } },
    { _id: 'PRD-SEED-027', name: 'Poulet Rôti',          price: 18000, stock: 40,  productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Plat',     ALLERGENES: 'Volaille',     CALORIES: 600, VEGETARIEN: false } },
    { _id: 'PRD-SEED-028', name: 'Salade de Fruits',     price: 7000,  stock: 120, productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Dessert',  ALLERGENES: 'Aucun',        CALORIES: 130, VEGETARIEN: true  } },
    { _id: 'PRD-SEED-029', name: 'Brochette Zébu',       price: 11000, stock: 55,  productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Plat',     ALLERGENES: 'Viande rouge', CALORIES: 380, VEGETARIEN: false } },
    { _id: 'PRD-SEED-030', name: 'Café Malagasy',        price: 4000,  stock: 300, productTypeId: 'PT-00003', shop: shopRestoRef, attributes: { CATEGORY: 'Boisson',  ALLERGENES: 'Caféine',      CALORIES: 25,  VEGETARIEN: true  } },
  ];

  await Product.insertMany([...smartphoneProducts, ...vetementProducts, ...restoProducts]);
  console.log(`   ✓ 30 produits créés (10 par boutique)`);

  // ── Résumé ────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed terminé avec succès !\n');
  console.log('Comptes créés :');
  console.log('  ADMIN     → login: admin_seed      / password: Admin1234');
  console.log('  BOUTIQUE  → login: boutique_tech   / password: Password123  (TechShop)');
  console.log('  BOUTIQUE  → login: boutique_fashion / password: Password123 (FashionShop)');
  console.log('  BOUTIQUE  → login: boutique_resto  / password: Password123  (BonAppétit)');
  console.log('\nIDs ProductTypes : PT-00001 (Smartphone), PT-00002 (Vêtement), PT-00003 (Restauration)');
  console.log('IDs Produits     : PRD-SEED-001 → PRD-SEED-030\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('\n❌ Erreur seed :', err.message);
  mongoose.disconnect();
  process.exit(1);
});
