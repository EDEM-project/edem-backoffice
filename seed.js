require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getPool } = require('./server/db');

async function seed() {
  const pool = await getPool();

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?', ['michele@gmail.com']
  );

  if (existing.length > 0) {
    console.log('Compte admin déjà existant.');
    process.exit(0);
  }

  const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Michele Linardi', 'michele@gmail.com', hashed, 'admin']
  );

  console.log('Compte admin créé :');
  console.log('  Email    : michele@gmail.com');
  console.log('  Password : ' + process.env.ADMIN_PASSWORD);
  console.log('  → Pensez à changer le mot de passe !');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erreur seed :', err);
  process.exit(1);
});
