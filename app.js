require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;



//
// ✅ Define CORS delegate early
//
const allowedOrigins = [
  'http://localhost:2369',
  'http://localhost:2368',
  'http://localhost:2370',
  'http://localhost:3000'
];

const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  const corsOptions = {
    origin: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  if (!origin || allowedOrigins.includes(origin)) {
    corsOptions.origin = true;
  }

  callback(null, corsOptions);
};

//for tracking ips behind a reverse proxy
app.set('trust proxy', true);


//
// ✅ Use CORS middleware early
//
app.use(cors(corsOptionsDelegate));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Static files
//
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

//
// Routes
//
app.use('/api', require('./routes/upload'));
app.use('/api', require('./routes/events'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/groups'));
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/internal'));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
