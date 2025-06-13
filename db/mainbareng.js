const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  const sql = `
    SELECT 
      e.id, e.title, e.sport, e.min_skill, e.max_skill, e.datetime, e.location, e.quota, e.host_id, e.description, e.price_per_participant, e.duration_hours,
      u.username AS host_username,
      (SELECT COUNT(*) FROM mainbareng_participants p WHERE p.event_id = e.id) AS slot_filled, p.payment_method
    FROM mainbareng_events e
    LEFT JOIN users u ON e.host_id = u.id
    LEFT JOIN pembayaran p ON e.pembayaran_id = p.id
    WHERE e.datetime >= NOW()
    ORDER BY e.datetime DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({success: false, message: 'DB error'});
    res.json({success: true, data: results});
  });
});

function skillLabel(val) {
  switch (parseInt(val)) {
    case 1: return 'newbie';
    case 2: return 'beginner';
    case 3: return 'intermediate';
    case 4: return 'advance';
    case 5: return 'pro';
    default: return 'newbie';
  }
}

router.post('/create', (req, res) => {
  const { title, sport, datetime, location, quota, host_id, description, price_per_participant, payment_method, min_skill, max_skill, duration_hours } = req.body;

  if (!host_id) {
    return res.status(400).json({success: false, message: 'host_id wajib diisi'});
  }

  db.query(
    'INSERT INTO pembayaran (payment_method) VALUES (?)',
    [payment_method],
    (err, result) => {
      if (err) return res.status(500).json({success: false, message: err.message});
      const pembayaranId = result.insertId;

  const sql = `
    INSERT INTO mainbareng_events 
    (title, sport, datetime, location, quota, host_id, description, price_per_participant, pembayaran_id, min_skill, max_skill, duration_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [title, sport, datetime, location, quota, host_id, description, price_per_participant, pembayaranId, min_skill, max_skill, duration_hours], (err, result) => {
    if (err) return res.status(500).json({success: false, message: err.message});
    const eventId = result.insertId;
    
    let hostSkill = skillLabel(min_skill);
    if (min_skill === max_skill) hostSkill = skillLabel(min_skill);

    db.query(
      'INSERT INTO mainbareng_participants (event_id, user_id, participant_status, skill) VALUES (?, ?, ?, ?)',
      [eventId, host_id, 'joined', hostSkill],
      (err2) => {
        if (err2) return res.status(500).json({success: false, message: err2.message});
        res.json({success: true, event_id: eventId});
      }
    );
  });
});
});

router.post('/:id/join', (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.user_id;
  const userSkill = req.body.skill;

  db.query('SELECT 1 FROM mainbareng_participants WHERE event_id = ? AND user_id = ?', 
  [eventId, userId],
  (errCheck, checkResults) => {
    if (errCheck) return res.status(500).json({ success: false, message: errCheck.message });
    if (checkResults.length && checkResults.length > 0) {
      return res.status(400).json({ success: false, message: 'Kamu sudah bergabung di event ini.' });
    }

  db.query(
  'INSERT INTO pembayaran_peserta (event_id, user_id, status, amount) VALUES (?, ?, ?, ?)',
  [eventId, host_id, 'waiting_payment', price_per_participant],
  (err3) => {
    if (err3) return res.status(500).json({success: false, message: err3.message});
    res.json({success: true, event_id: eventId});
  }
);

  db.query(
  'INSERT INTO pembayaran_peserta (event_id, user_id, status, amount) VALUES (?, ?, ?, ?)',
  [eventId, userId, 'waiting_payment', price_per_participant],
  (err4) => {
    if (err4) return res.status(500).json({success: false, message: err4.message});
    res.json({ success: true, message: 'Berhasil join event!' });
  }
);

    // Ambil min_skill dan max_skill event
  db.query('SELECT min_skill, max_skill FROM mainbareng_events WHERE id = ?', [eventId], (err2, eventResults) => {
    if (err2 || eventResults.length === 0) return res.status(400).json({ success: false, message: 'Event tidak ditemukan' });
    const { min_skill, max_skill } = eventResults[0];

    // Urutan skill
    const skillOrder = ['newbie', 'beginner', 'intermediate', 'advance', 'pro'];
    const idxUser = skillOrder.indexOf(userSkill);
    const idxMin = skillOrder.indexOf(min_skill);
    const idxMax = skillOrder.indexOf(max_skill);

    if (idxUser === -1 || idxMin === -1 || idxMax === -1) {
      return res.status(400).json({ success: false, message: 'Skill kamu tidak sesuai dengan syarat event ini' });
    }

    // Validasi skill user dalam range
    if (idxUser < idxMin || idxUser > idxMax) {
      return res.json({ success: false, message: 'Skill kamu tidak sesuai dengan syarat event ini.' });
    }

    // Lanjutkan proses join
    db.query(
      'INSERT INTO mainbareng_participants (event_id, user_id, participant_status, skill) VALUES (?, ?, ?, ?)',
      [eventId, userId, 'waiting_payment', userSkill],
      (err3) => {
        if (err3) return res.status(500).json({ success: false, message: err3.message });
         res.json({ success: true, message: 'Berhasil join event!' });
        }
      );
    });
  });
  }
);

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      e.id, e.title, e.sport, e.datetime, e.location, e.quota, e.host_id, e.description, e.price_per_participant, e.duration_hours, e.pembayaran_id,
      u.username AS host_username,
      p.payment_method,
      e.min_skill, e.max_skill,
      (SELECT COUNT(*) FROM mainbareng_participants p2 WHERE p2.event_id = e.id) AS slot_filled
    FROM mainbareng_events e
    LEFT JOIN users u ON e.host_id = u.id
    LEFT JOIN pembayaran p ON e.pembayaran_id = p.id
    WHERE e.id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({success: false, message: 'DB error'});
    if (!results || results.length === 0) {
      return res.status(404).json({success: false, message: 'Event tidak ditemukan'});
    }
    res.json({success: true, data: results[0]});
  });
});

router.get('/user/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sql = `
    SELECT 
      e.*, u.username AS host_username, p.participant_status,
      (SELECT status FROM pembayaran_peserta WHERE event_id = e.id AND user_id = e.host_id LIMIT 1) AS host_payment_status
    FROM mainbareng_participants p
    JOIN mainbareng_events e ON p.event_id = e.id
    LEFT JOIN users u ON e.host_id = u.id
    WHERE p.user_id = ?
    ORDER BY e.datetime DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({success: false, message: 'DB error'});
    const now = new Date();
    results.forEach(ev => {
      const startDate = new Date(ev.datetime);
      const endDate = new Date(ev.datetime);
      endDate.setHours(endDate.getHours() + (ev.duration_hours || 2));
      if (now >= startDate && ev.host_payment_status !== 'paid') {
        ev.participant_status = 'cancelled';
      }
    });
    res.json({success: true, data: results});
  });
});

router.get('/:id/participants', (req, res) => {
  const eventId = req.params.id;
  const sql = `
    SELECT p.id, p.user_id, u.username, u.email, p.participant_status, p.skill,
    pp.status AS payment_status
    FROM mainbareng_participants p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN pembayaran_peserta pp ON pp.event_id = p.event_id AND pp.user_id = p.user_id
    WHERE p.event_id = ?
  `;
  db.query(sql, [eventId], (err, results) => {
    if (err) return res.status(500).json({success: false, message: 'DB error'});
    res.json({success: true, data: results});
  });
});

router.post('/:id/finish', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE mainbareng_events SET finished = 1 WHERE id = ?', [id], err => {
    if (err) return res.status(500).json({success: false});
    res.json({success: true});
  });
});

module.exports = router;