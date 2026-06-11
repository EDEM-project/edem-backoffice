const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { requireAuth, requireAdmin } = require('./auth');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  ).run(name, email, hashed, role || 'author');

  res.status(201).json({ id: result.lastInsertRowid, name, email, role: role || 'author' });
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'Utilisateur supprimé' });
});

module.exports = router;
