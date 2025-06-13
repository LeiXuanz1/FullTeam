const express = require('express');
const cors = require('cors');
const app = express();
const authMiddleware = require('./db/users');

app.use(cors());
app.use(express.json());

app.use('/api/mainbareng', require('./db/mainbareng'));
app.use('/api', require('./db/register'));
app.use('/api', require('./db/login'));
app.use('/api', require('./db/profile'));
app.use('/api', require('./db/change-password'));
app.use('api/secure', authMiddleware, require('./db/secureRoutes'))

app.listen(3000, () => console.log('API server running at http://localhost:3000'));