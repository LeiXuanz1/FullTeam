const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) return res.json({ success: false, message: 'Lengkapi semua field' });

  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, oldPassword], (err, results) => {
    if (err) return res.json({ success: false, message: 'Database error' });
    if (results.length === 0) return res.json({ success: false, message: 'Password lama salah' });

    db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email], (err2) => {
      if (err2) return res.json({ success: false, message: 'Gagal mengubah password' });
      res.json({ success: true, message: 'Password berhasil diubah' });
    });
  });
});

module.exports = router;