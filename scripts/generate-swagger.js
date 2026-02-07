const fs = require('fs');
const path = require('path');

// Load the swagger spec from the existing config
const specs = require('../src/config/swagger');

const outDir = path.join(__dirname, '..', 'public');
const outFile = path.join(outDir, 'swagger.json');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(specs, null, 2), 'utf8');
console.log('Swagger JSON generated at', outFile);
