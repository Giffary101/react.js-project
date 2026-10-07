// Mengimpor pustaka sqlite3. Tambahan .verbose() berguna untuk melacak error secara detail.
const sqlite3 = require('sqlite3').verbose();

// 1. Membuat koneksi ke berkas basis data
// Jika berkas 'sistem_login.sqlite' belum ada, SQLite akan otomatis membuatnya di folder backend.
const db = new sqlite3.Database('./sistem_login.sqlite', (err) => {
    if (err) {
        console.error('Gagal terhubung ke SQLite:', err.message);
    } else {
        console.log('Berhasil terhubung ke basis data SQLite.');
    }
});

// 2. Inisialisasi Struktur Tabel (Skema)
// db.serialize memastikan semua perintah di dalamnya dieksekusi secara berurutan (sinkron).
db.serialize(() => {
    // Membuat tabel 'pengguna' jika belum ada
    const buatTabel = `CREATE TABLE IF NOT EXISTS pengguna (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`;
    db.run(buatTabel);

    // 3. Menyisipkan Data Awal (Seeding)
    // Kita buat satu akun default agar Anda bisa langsung mencoba fitur login nantinya.
    // Gunakan 'INSERT OR IGNORE' agar data tidak menjadi ganda jika server dijalankan berulang kali.
    const tambahPengguna = `INSERT OR IGNORE INTO pengguna (username, password) VALUES (?, ?)`;
    db.run(tambahPengguna, ['admin', 'rahasia123']);
});

// Mengekspor objek 'db' agar bisa digunakan oleh berkas lain (seperti server.js)
module.exports = db;