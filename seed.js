require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./server/db');

const existing = db.prepare("SELECT id FROM users WHERE email = 'michele@etis.fr'").get();

if (existing) {
  console.log('Compte admin déjà existant.');
  process.exit(0);
}

const hashed = bcrypt.hashSync('changeme123', 10);

db.prepare(
  "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
).run('Michele Linardi', 'michele@etis.fr', hashed, 'admin');

console.log('Compte admin créé :');
console.log('  Email    : michele@etis.fr');
console.log('  Password : changeme123');
console.log('  → Pensez à changer le mot de passe !');
