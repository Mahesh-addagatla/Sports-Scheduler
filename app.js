// app.js
const express = require('express');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const { User } = require('./models');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const saltRounds = 10;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust path to your views directory

// Route to render registration form
app.get('/signup', (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
});

// Route handling player creation
app.post('/create-player', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPwd = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPwd,
      role
    });

    res.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/signin', (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
  });
  
  app.post('/signinsubmit', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).send('User not found');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).send('Incorrect password');
      }
  
      if (user.role === 'admin') {
        res.redirect('/admindashboard');
      } else if (user.role === 'player') {
        res.redirect('/playerdashboard');
      } else {
        res.status(403).send('Unauthorized');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Internal server error');
    }
  });

module.exports = app;
