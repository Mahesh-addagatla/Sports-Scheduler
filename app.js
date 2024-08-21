const express = require('express');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const { user } = require('./models');
const path = require('path');
const app = express();
const saltRounds = 10;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(csrf({ cookie: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust path to your views directory

// Route to render registration form
app.get('/signup', (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
});

// Example route handling admin creation
app.post('/create-admin', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPwd = await bcrypt.hash(password, saltRounds);
    // Handle Admin creation here

    res.json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating Admin:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example route handling player creation
app.post('/create-player', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const newPlayer = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPwd,
    });

    res.json({ message: 'Player created successfully', player: newPlayer });
  } catch (error) {
    console.error('Error creating Player:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = app;
