require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./auth');
const publicationsRoutes = require('./publications');
const usersRoutes = require('./users');
const uploadsRoutes = require('./uploads');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

app.use('/api/auth', authRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/uploads', uploadsRoutes);

app.listen(PORT, () => {
  console.log(`Serveur EDEM démarré sur http://localhost:${PORT}`);
});