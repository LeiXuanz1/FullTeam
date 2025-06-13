const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT id, email, nama FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: 'Login gagal' });
    }
    const user = results[0];
    res.json({ success: true, user: { id: user.id, email: user.email, nama: user.nama } });
  });
});

module.exports = router;