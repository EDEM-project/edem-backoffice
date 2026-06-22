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

  const password = 'changeme123';
  const hashed = bcrypt.hashSync(password, 10);

  await pool.execute(
    'INSERT INTO users (name, email, password, role, titre, institution, bio) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      'Michele Linardi',
      'michele@etis.fr',
      hashed,
      'admin',
      'Maître de conférences',
      'IUT de Cergy-Pontoise / ETIS',
      'Chercheur informatique et enseignant à l\'IUT de Cergy-Pontoise, membre du laboratoire ETIS chez data&AI.'
    ]
  );

  console.log('Compte admin créé :');
  console.log('  Email    : michele@etis.fr');
  console.log('  Password : changeme123');
  console.log('  → Pensez à changer le mot de passe !');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erreur seed :', err.message);
  process.exit(1);
});
