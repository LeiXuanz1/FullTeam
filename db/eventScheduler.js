const db = require('./db');

// Jalankan setiap 5 menit
setInterval(() => {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000); // 1 jam ke depan

  // Ambil event yang akan mulai dalam 1 jam
  const sql = `
    SELECT e.id, e.datetime, e.host_id
    FROM mainbareng_events e
    WHERE e.datetime BETWEEN ? AND ?
  `;
  db.query(sql, [now, soon], (err, events) => {
    if (err) return console.error('Scheduler DB error:', err);
    if (!events.length) return;

    events.forEach(event => {
      // Cek status pembayaran host
      db.query(
        'SELECT status FROM pembayaran_peserta WHERE event_id = ? AND user_id = ?',
        [event.id, event.host_id],
        (err2, results) => {
          if (err2) return console.error('Scheduler DB error:', err2);
          if (!results.length || results[0].status !== 'paid') {
            // Hapus event & peserta jika host belum bayar
            db.query('DELETE FROM mainbareng_participants WHERE event_id = ?', [event.id]);
            db.query('DELETE FROM pembayaran_peserta WHERE event_id = ?', [event.id]);
            db.query('DELETE FROM mainbareng_events WHERE id = ?', [event.id]);
            console.log(`Event ID ${event.id} dihapus karena host belum bayar.`);
          }
        }
      );
    });
  });
}, 5 * 60 * 1000); // setiap 5 menit