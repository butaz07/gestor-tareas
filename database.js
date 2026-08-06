const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'data', 'db.json'));
const db = low(adapter);

// Estructura inicial de la base de datos
db.defaults({ users: [], tasks: [] }).write();


// Estas credenciales son las que se usarán en TODOS los casos de prueba de Selenium.
const existingUser = db.get('users').find({ username: 'admin' }).value();
if (!existingUser) {
  const hashedPassword = bcrypt.hashSync('Admin123', 10);
  db.get('users')
    .push({ id: 1, username: 'admin', password: hashedPassword })
    .write();
  console.log('Usuario sembrado -> username: admin | password: Admin123');
}

module.exports = db;
