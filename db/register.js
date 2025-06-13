const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/register', (req, res) => {
  console.log('req.body:', req.body);
  const { nama, username, ponsel, email, password } = req.body;
  if (!nama || !username || !ponsel || !email || !password) {
    return res.json({ success: false, message: 'Semua field wajib diisi' });
  }

  db.query('SELECT * FROM users WHERE email = ? OR ponsel = ?', [email, ponsel], (err, results) => {
    if (err) return res.json({ success: false, message: 'Database error' });
    if (results.length > 0) return res.json({ success: false, message: 'Email atau Nomor Ponsel sudah terdaftar' });

    db.query(
      'INSERT INTO users (email, password, nama, username, ponsel) VALUES (?, ?, ?, ?, ?)',
      [email, password, nama, username, ponsel],
      (err2) => {
        if (err2) return res.json({ success: false, message: 'Gagal mendaftar' });
        res.json({ success: true });
      }
    );
  });
});

module.exports = router;