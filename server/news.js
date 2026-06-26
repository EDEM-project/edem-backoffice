const express = require('express');
const { getPool } = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

// GET all news — public
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(`
      SELECT news.*, users.name AS author_name
      FROM news
      JOIN users ON news.author_id = users.id
      ORDER BY news.published_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET one news item — public
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(`
      SELECT news.*, users.name AS author_name
      FROM news
      JOIN users ON news.author_id = users.id
      WHERE news.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Actualité introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST create — authenticated
router.post('/', requireAuth, async (req, res) => {
  const { title, content, image_url, published_at } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }
  try {
    const pool = await getPool();
    const date = published_at || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.execute(
      'INSERT INTO news (title, content, image_url, published_at, author_id) VALUES (?, ?, ?, ?, ?)',
      [title, content, image_url || '', date, req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT update — author or admin
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Actualité introuvable' });
    const item = rows[0];

    if (item.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { title, content, image_url, published_at } = req.body;
    await pool.execute(
      'UPDATE news SET title=?, content=?, image_url=?, published_at=? WHERE id=?',
      [
        title || item.title,
        content !== undefined ? content : item.content,
        image_url !== undefined ? image_url : item.image_url,
        published_at || item.published_at,
        req.params.id,
      ]
    );
    const [updated] = await pool.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE — author or admin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Actualité introuvable' });
    const item = rows[0];

    if (item.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await pool.execute('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'Actualité supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
