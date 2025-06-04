const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/venues', (req, res) => {
  db.query('SELECT * FROM venues', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;