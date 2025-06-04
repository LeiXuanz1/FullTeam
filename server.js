const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./db/venues'));
app.use('/api', require('./db/booking'));

app.listen(3000, () => console.log('API server running at http://localhost:3000'));