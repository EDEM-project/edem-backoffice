const express = require('express');
const db = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT posts.*, users.name AS author_name
    FROM posts
    JOIN users ON posts.author_id = users.id
    ORDER BY posts.created_at DESC
  `).all();
  res.json(posts);
});

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT posts.*, users.name AS author_name
    FROM posts
    JOIN users ON posts.author_id = users.id
    WHERE posts.id = ?
  `).get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post introuvable' });
  res.json(post);
});

router.post('/', requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }

  const result = db.prepare(
    'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)'
  ).run(title, content, req.user.id);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

router.put('/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post introuvable' });

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres posts' });
  }

  const { title, content } = req.body;
  db.prepare(
    "UPDATE posts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title || post.title, content || post.content, req.params.id);

  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post introuvable' });

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres posts' });
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post supprimé' });
});

module.exports = router;
