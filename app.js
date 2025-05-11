const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:2368' }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// Routes
app.use('/api', require('./routes/upload'));
app.use('/api', require('./routes/events'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/groups'));

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});