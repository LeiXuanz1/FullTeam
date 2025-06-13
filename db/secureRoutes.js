const express = require('express');
const router = express.Router();

router.get('/secure-data', (req, res) => {
  res.json({ message: 'Ini data aman, hanya bisa diakses jika sudah autentikasi.' });
});

module.exports = router;