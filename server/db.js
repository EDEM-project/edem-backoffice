const mysql = require('mysql2/promise');

let pool;

async function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await initTables();
  return pool;
}

async function initTables() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'author') NOT NULL DEFAULT 'author',
        titre VARCHAR(255),
        institution VARCHAR(255),
        bio TEXT,
        competences VARCHAR(500),
        photo_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        email_public VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        published_at DATETIME NOT NULL,
        author_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS publications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        explanation TEXT,
        code_snippet TEXT,
        code_language VARCHAR(50) DEFAULT 'Python',
        tags VARCHAR(500),
        type ENUM('recherche', 'rapport', 'article') DEFAULT 'recherche',
        pdf_url VARCHAR(500),
        image_url VARCHAR(500),
        author_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  } finally {
    conn.release();
  }
}

module.exports = { getPool };
