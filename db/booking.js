const express = require('express');
const router = express.Router();
const db = require('./db');

// Endpoint: Ambil jadwal booking untuk venue & tanggal tertentu
router.get('/schedule', (req, res) => {
  const { venueId, date } = req.query;
  const slots = [
    "07:00-08:00","08:00-09:00","09:00-10:00","10:00-11:00","11:00-12:00",
    "12:00-13:00","13:00-14:00","14:00-15:00","15:00-16:00","16:00-17:00",
    "17:00-18:00","18:00-19:00","19:00-20:00","20:00-21:00","21:00-22:00"
  ];
  db.query(
    'SELECT time FROM bookings WHERE venue_id=? AND date=?',
    [venueId, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const bookedTimes = results.map(r => r.time);
      const response = slots.map(time => ({
        time,
        booked: bookedTimes.includes(time)
      }));
      res.json(response);
    }
  );
});

// Endpoint: Booking slot
router.post('/book', (req, res) => {
  const { venueId, date, time } = req.body;
  db.query(
    'SELECT * FROM bookings WHERE venue_id=? AND date=? AND time=?',
    [venueId, date, time],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.json({ success: false, message: 'Slot sudah dibooking!' });
      }
      db.query(
        'INSERT INTO bookings (venue_id, date, time) VALUES (?, ?, ?)',
        [venueId, date, time],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true, message: 'Booking berhasil!' });
        }
      );
    }
  );
});

module.exports = router;