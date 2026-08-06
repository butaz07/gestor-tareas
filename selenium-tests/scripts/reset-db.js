// Borra el contenido de data/db.json antes de cada corrida de pruebas.
// Al reiniciar, database.js vuelve a sembrar el usuario admin automáticamente.
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json');

fs.writeFileSync(dbPath, '{}');
console.log('Base de datos reiniciada para las pruebas.');
