const express = require('express');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const { User, Event, PlayerEvent } = require('./models');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const saltRounds = 10;
const flash = require('connect-flash');
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'my-secret-key-12345678',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { email: username } });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});


app.use((req, res, next) => {
  res.locals.errorMessage = req.flash('error');
  next();
});


// Routes
app.get('/signup', (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
});

app.get("/", (req, res) => {
  res.render("index", {
    csrfToken: req.csrfToken(),
  });
});

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

    res.render("login", { csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'User may already exist or Internal server error' });
  }
});

app.get('/signin', (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
});

app.post('/signinsubmit', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true,
}), (req, res) => {
  if (req.user.role === 'admin') {
    res.redirect('/admindashboard');
  } else if (req.user.role === 'player') {
    res.redirect('/playerdashboard');
  } else {
    res.status(403).send('Unauthorized');
  }
});

// Route to render create event form
app.get('/create-event', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }
  res.render('create-event', { csrfToken: req.csrfToken() });
});

// Route to handle event creation
app.post('/create-event', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const { title, date, time, venue, team_limit, description } = req.body;

    const newEvent = await Event.create({
      title,
      date,
      time,
      venue,
      team_limit,
      description,
      adminId: req.user.id
    });

    res.redirect('/admindashboard');
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to render edit event form
app.get('/edit-event/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const event = await Event.findOne({ where: { id: req.params.id, adminId: req.user.id } });

    if (!event) {
      return res.status(404).send('Event not found');
    }

    res.render('edit-event', { event, csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching event:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to handle event editing
app.post('/edit-event/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const { title, date, time, venue, team_limit, description } = req.body;
    const event = await Event.findOne({ where: { id: req.params.id, adminId: req.user.id } });

    if (!event) {
      return res.status(404).send('Event not found');
    }

    event.title = title;
    event.date = date;
    event.time = time;
    event.venue = venue;
    event.team_limit = team_limit;
    event.description = description;

    await event.save();

    res.redirect('/admindashboard');
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to handle event deletion
app.post('/delete-event/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const event = await Event.findOne({ where: { id: req.params.id, adminId: req.user.id } });

    if (!event) {
      return res.status(404).send('Event not found');
    }

    await event.destroy();

    res.redirect('/admindashboard');
  } catch (error) {
    console.error('Error deleting event:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to render admin dashboard with events
app.get('/admindashboard', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const events = await Event.findAll({ where: { adminId: req.user.id } });
    res.render('admindashboard', { User: req.user,events, csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to render player dashboard with all events and join/unjoin functionality
app.get('/playerdashboard', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const events = await Event.findAll();
    const joinedEvents = await PlayerEvent.findAll({ where: { playerId: req.user.id } });
    const joinedEventIds = joinedEvents.map(je => je.eventId);

    res.render('playerdashboard', { User: req.user,events, joinedEventIds, csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to handle joining an event
app.post('/join-event/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    await PlayerEvent.create({ playerId: req.user.id, eventId: id });

    res.redirect('/playerdashboard');
  } catch (error) {
    console.error('Error joining event:', error.message);
    res.status(500).send('Internal server error');
  }
});


app.post('/unjoin-event/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).send('Unauthorized');
  }

  try {
    const { id } = req.params;
    const playerEvent = await PlayerEvent.findOne({ where: { playerId: req.user.id, eventId: id } });

    if (!playerEvent) {
      return res.status(404).send('Player is not joined to this event');
    }

    await playerEvent.destroy();

    res.redirect('/playerdashboard');
  } catch (error) {
    console.error('Error unjoining event:', error.message);
    res.status(500).send('Internal server error');
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Internal server error');
    }
    res.redirect('/');
  });
});


module.exports = app;
