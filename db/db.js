const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // ganti dengan password MySQL
  database: 'fullteam'
});
module.exports = db;