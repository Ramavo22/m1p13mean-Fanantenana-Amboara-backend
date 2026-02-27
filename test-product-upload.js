// Script de test pour vérifier l'upload de produits
// Lancez ce script avec: node test-product-upload.js

const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Configuration
const API_URL = 'http://localhost:3000';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Remplacez par un token valide

// Fonction pour tester la création d'un produit
async function testCreateProduct() {
  console.log('🧪 Test de création de produit...\n');

  const formData = new FormData();
  
  // Ajouter les données exactement comme le frontend Angular
  formData.append('name', 'Iphone 16');
  formData.append('price', '200000');
  formData.append('productTypeId', 'PT-001');
  formData.append('attributes', JSON.stringify({
    "BRAND": "Iphone 16",
    "STORAGE": "64GB",
    "RAM": "8GB",
    "5G": true
  }));

  // Si vous voulez tester avec une photo, décommentez ces lignes:
  // const imageBuffer = fs.readFileSync('path/to/test-image.jpg');
  // formData.append('photo', imageBuffer, {
  //   filename: 'test-image.jpg',
  //   contentType: 'image/jpeg'
  // });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📋 Status:', res.statusCode);
        console.log('📋 Headers:', res.headers);
        console.log('📋 Body:', data);
        
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.success) {
            console.log('\n✅ Succès! Produit créé:');
            console.log(JSON.stringify(jsonData.data, null, 2));
          } else {
            console.log('\n❌ Erreur:', jsonData.message);
          }
        } catch (e) {
          console.log('\n⚠️ Réponse non-JSON:', data);
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Erreur réseau:', err);
      reject(err);
    });

    formData.pipe(req);
  });
}

// Vérifier que le serveur est démarré
console.log('🚀 Assurez-vous que le serveur est démarré (npm run dev)\n');
console.log('🔑 Remplacez TOKEN dans ce script par un vrai JWT token\n');

// Lancer le test après 2 secondes
setTimeout(() => {
  testCreateProduct().catch(console.error);
}, 2000);
