const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/profile', (req, res) => {
  const { email } = req.body;
  db.query('SELECT nama, username, ponsel, email FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.json({ success: false });
    res.json({ success: true, user: results[0] });
  });
});

router.post('/profile/update', (req, res) => {
  const { nama, username, ponsel, email } = req.body;
  db.query(
    'UPDATE users SET nama=?, username=?, ponsel=? WHERE email=?',
    [nama, username, ponsel, email],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Database error' });
      res.json({ success: true });
    }
  );  
});

module.exports = router;