require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN_URL = process.env.ORIGIN_URL || 'http://localhost';



//
// ✅ Define CORS delegate early
//
const allowedOrigins = process.env.ALLOWED_PORTS 
  ? process.env.ALLOWED_PORTS.split(',').map(port => `${ORIGIN_URL}:${port.trim()}`)
  : [
      `${ORIGIN_URL}:2368`,
      `${ORIGIN_URL}:2369`,
      `${ORIGIN_URL}:2370`,
      `${ORIGIN_URL}:2371`,
      `${ORIGIN_URL}:2372`,
      `${ORIGIN_URL}:2373`,
      `${ORIGIN_URL}:2374`,
      `${ORIGIN_URL}:2375`,
      `${ORIGIN_URL}:2376`,
      `${ORIGIN_URL}:2377`,
      `${ORIGIN_URL}:2378`,
      `${ORIGIN_URL}:3000`,
      `${ORIGIN_URL}:8180`
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
app.use('/api', require('./routes/token'));
app.use('/', require('./routes/secure'));


app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
