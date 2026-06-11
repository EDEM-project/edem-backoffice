require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getPool } = require('./server/db');

async function seed() {
  const pool = await getPool();

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?', ['michele@etis.fr']
  );

  if (existing.length > 0) {
    console.log('Compte admin déjà existant.');
    process.exit(0);
  }

  const hashed = bcrypt.hashSync('changeme123', 10);
  await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Michele Linardi', 'michele@etis.fr', hashed, 'admin']
  );

  console.log('Compte admin créé :');
  console.log('  Email    : michele@etis.fr');
  console.log('  Password : changeme123');
  console.log('  → Pensez à changer le mot de passe !');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erreur seed :', err);
  process.exit(1);
});
