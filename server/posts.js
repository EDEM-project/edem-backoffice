const express = require('express');
const { getPool } = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [posts] = await pool.execute(`
      SELECT posts.*, users.name AS author_name
      FROM posts
      JOIN users ON posts.author_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(`
      SELECT posts.*, users.name AS author_name
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE posts.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Post introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }

  try {
    const pool = await getPool();
    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Post introuvable' });
    const post = rows[0];

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres posts' });
    }

    const { title, content } = req.body;
    await pool.execute(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title || post.title, content || post.content, req.params.id]
    );

    const [updated] = await pool.execute('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Post introuvable' });
    const post = rows[0];

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres posts' });
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
