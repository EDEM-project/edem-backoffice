require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const usersRoutes = require('./users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

app.use('/admin', express.static(path.join(__dirname, '../admin')));

app.listen(PORT, () => {
  console.log(`Serveur EDEM démarré sur http://localhost:${PORT}`);
});
