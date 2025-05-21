const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const allowedOrigins = [
  'http://localhost:2369',
  'http://localhost:2368', // Ghost Admin
  'http://localhost:2370',
  'http://localhost:3000'  // example: Vite dev server or another frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  optionsSuccessStatus: 200
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
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