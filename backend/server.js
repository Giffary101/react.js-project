// Mengimpor modul bawaan Node.js untuk membuat peladen HTTP
const http = require('http');

const db = require('./database');

// Objek penampung sementara untuk menyimpan status sesi pengguna.
// Pada tahap selanjutnya, penyimpanan ini akan digantikan oleh tabel di SQLite.
const sesiPengguna = {};

// Membuat peladen HTTP utama
const server = http.createServer((req, res) => {
    // 1. Konfigurasi CORS (Cross-Origin Resource Sharing)
    // Sangat penting agar aplikasi React di antarmuka pengguna diizinkan untuk mengambil data dari peladen ini.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Menangani permintaan "preflight" dari peramban
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

// Rute API Login
  if (req.url === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const { username, password } = JSON.parse(body);

      // Kueri untuk mencari kecocokan akun di SQLite
      const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
      
      db.get(query, [username, password], (err, row) => {
        if (err) {
          console.error("Galat saat login:", err.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Terjadi kesalahan pada peladen.' }));
        }
        
        if (row) {
          // Jika 'row' berisi data, berarti kombinasi username & password ditemukan
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Login berhasil', user: row.username }));
        } else {
          // Jika 'row' kosong (undefined), berarti kredensial salah atau tidak ada
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Kredensial tidak valid' }));
        }
      });
    });
    return;
  }

    // Rute API Registrasi
  if (req.url === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const { username, password } = JSON.parse(body);

      // Mencegah input kosong
      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Nama pengguna dan kata sandi wajib diisi.' }));
      }

      // Mengeksekusi kueri penambahan data
      const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
      
      db.run(query, [username, password], function(err) {
        if (err) {
          // Tambahkan baris ini untuk mencetak galat murni ke terminal backend
          console.error("Bocoran Kesalahan SQLite:", err.message); 
          
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Nama pengguna sudah digunakan atau terjadi kesalahan.' }));
        }
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Akun berhasil dibuat! Silakan masuk.' }));
      });
    });
    return;
  }

    // 3. Rute API: Pengecekan Status Sesi (Otomatisasi Logout)
    // Rute ini dapat dipanggil oleh antarmuka React untuk memastikan pengguna masih boleh mengakses halaman
    if (req.url === '/api/status' && req.method === 'GET') {
        // Mengambil token dari header otorisasi yang dikirim klien
        const headerOtorisasi = req.headers['authorization'];
        const token = headerOtorisasi ? headerOtorisasi.split(' ')[1] : null;

        const sesi = sesiPengguna[token];

        // Validasi: Apakah sesi ada dan apakah waktu saat ini sudah melewati batas 2 menit?
        if (sesi && Date.now() < sesi.batasWaktu) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ pesan: 'Sesi aktif', pengguna: sesi.username }));
        } else {
            // Jika kedaluwarsa, hapus sesi dari penyimpanan
            if (sesi) delete sesiPengguna[token];
            
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ pesan: 'Sesi telah berakhir. Silakan login kembali.' }));
        }
        return;
    }

    // 4. Penanganan Rute Tidak Ditemukan (404 Fallback)
    // Jika URL yang diminta tidak cocok dengan kondisi di atas
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ pesan: 'Titik akhir API tidak ditemukan' }));
});

// Menentukan port tempat peladen akan berjalan dan mendengarkan permintaan
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Peladen Node.js berjalan tanpa Express di http://localhost:${PORT}`);
});