const sqlite3 = require('sqlite3').verbose();

// Menghubungkan ke berkas pangkalan data
const db = new sqlite3.Database('./sistem_login.sqlite', (err) => {
  if (err) {
    console.error('Gagal terhubung ke pangkalan data:', err.message);
  } else {
    console.log('Berhasil terhubung ke basis data SQLite.');
  }
});

// Menyiapkan struktur tabel secara otomatis
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
});

module.exports = db;