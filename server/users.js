const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('./db');
const { requireAuth, requireAdmin } = require('./auth');

const router = express.Router();

function parseUser(u) {
  return { ...u, competences: u.competences ? u.competences.split(',').map(c => c.trim()) : [] };
}

// GET tous les utilisateurs — public (pour equipe.html)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, titre, titre_en, institution, bio, bio_en, competences, photo_url, linkedin_url, email_public, role, created_at FROM users ORDER BY created_at ASC'
    );
    res.json(rows.map(parseUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET un utilisateur par id — public (pour chercheur.html)
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, titre, titre_en, institution, bio, bio_en, competences, photo_url, linkedin_url, email_public, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(parseUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST créer un utilisateur — admin seulement
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role, titre, institution, bio, competences, linkedin_url, email_public } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }

  try {
    const pool = await getPool();
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const hashed = bcrypt.hashSync(password, 10);
    const competencesStr = Array.isArray(competences) ? competences.join(',') : (competences || '');

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, titre, institution, bio, competences, linkedin_url, email_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, role || 'author', titre || '', institution || '', bio || '', competencesStr, linkedin_url || '', email_public || '']
    );

    res.status(201).json({ id: result.insertId, name, email, role: role || 'author' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT modifier un utilisateur — admin seulement
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const u = rows[0];

    const { name, titre, institution, bio, competences, linkedin_url, email_public, photo_url, titre_en, bio_en } = req.body;
    const competencesStr = Array.isArray(competences) ? competences.join(',') : (competences !== undefined ? competences : u.competences);

    await pool.execute(
      'UPDATE users SET name=?, titre=?, institution=?, bio=?, competences=?, linkedin_url=?, email_public=?, photo_url=?, titre_en=?, bio_en=? WHERE id=?',
      [
        name || u.name,
        titre !== undefined ? titre : u.titre,
        institution !== undefined ? institution : u.institution,
        bio !== undefined ? bio : u.bio,
        competencesStr,
        linkedin_url !== undefined ? linkedin_url : u.linkedin_url,
        email_public !== undefined ? email_public : u.email_public,
        photo_url !== undefined ? photo_url : u.photo_url,
        titre_en !== undefined ? titre_en : u.titre_en,
        bio_en !== undefined ? bio_en : u.bio_en,
        req.params.id
      ]
    );

    const [updated] = await pool.execute('SELECT id, name, titre, titre_en, institution, bio, bio_en, competences, photo_url, linkedin_url, email_public, role FROM users WHERE id = ?', [req.params.id]);
    res.json(parseUser(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE — admin seulement
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
