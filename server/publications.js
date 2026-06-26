const express = require('express');
const { getPool } = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

function parseTags(pub) {
  return { ...pub, tags: pub.tags ? pub.tags.split(',').map(t => t.trim()) : [] };
}

// GET toutes les publications (public)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(`
      SELECT publications.*, users.name AS author_name
      FROM publications
      JOIN users ON publications.author_id = users.id
      ORDER BY publications.created_at DESC
    `);
    res.json(rows.map(parseTags));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET une publication par id (public)
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute(`
      SELECT publications.*, users.name AS author_name
      FROM publications
      JOIN users ON publications.author_id = users.id
      WHERE publications.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Publication introuvable' });
    res.json(parseTags(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST créer une publication (authentifié)
router.post('/', requireAuth, async (req, res) => {
  const { title, summary, explanation, code_snippet, code_language, tags, type, pdf_url, image_url, title_en, summary_en, explanation_en } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ error: 'Titre et résumé requis' });
  }

  try {
    const pool = await getPool();
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    const [result] = await pool.execute(
      `INSERT INTO publications (title, summary, explanation, code_snippet, code_language, tags, type, pdf_url, image_url, author_id, title_en, summary_en, explanation_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, explanation || '', code_snippet || '', code_language || 'Python', tagsStr, type || 'recherche', pdf_url || '', image_url || '', req.user.id, title_en || '', summary_en || '', explanation_en || '']
    );
    const [rows] = await pool.execute('SELECT * FROM publications WHERE id = ?', [result.insertId]);
    res.status(201).json(parseTags(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT modifier (auteur ou admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM publications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Publication introuvable' });
    const pub = rows[0];

    if (pub.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { title, summary, explanation, code_snippet, code_language, tags, type, pdf_url, image_url, title_en, summary_en, explanation_en } = req.body;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags !== undefined ? tags : pub.tags);

    await pool.execute(
      `UPDATE publications SET title=?, summary=?, explanation=?, code_snippet=?, code_language=?, tags=?, type=?, pdf_url=?, image_url=?, title_en=?, summary_en=?, explanation_en=? WHERE id=?`,
      [
        title || pub.title,
        summary || pub.summary,
        explanation !== undefined ? explanation : pub.explanation,
        code_snippet !== undefined ? code_snippet : pub.code_snippet,
        code_language || pub.code_language,
        tagsStr,
        type || pub.type,
        pdf_url !== undefined ? pdf_url : pub.pdf_url,
        image_url !== undefined ? image_url : pub.image_url,
        title_en !== undefined ? title_en : pub.title_en,
        summary_en !== undefined ? summary_en : pub.summary_en,
        explanation_en !== undefined ? explanation_en : pub.explanation_en,
        req.params.id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM publications WHERE id = ?', [req.params.id]);
    res.json(parseTags(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE (auteur ou admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM publications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Publication introuvable' });
    const pub = rows[0];

    if (pub.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await pool.execute('DELETE FROM publications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Publication supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
