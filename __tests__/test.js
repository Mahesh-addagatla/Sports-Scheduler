const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const { User, Event, PlayerEvent } = require('../models');

// Helper function to create a hashed password
const hashPassword = async (password) => {
  const hashedPwd = await bcrypt.hash(password, 10);
  return hashedPwd;
};

describe('Sports-Scheduler Application', () => {
  let server, agent;

  beforeAll(async () => {
    // Ensure the database is synchronized and server is started
    await User.sync({ force: true });
    await Event.sync({ force: true });
    await PlayerEvent.sync({ force: true });
    server = app.listen(4000);
    agent = request.agent(server);
  });

  afterAll(async () => {
    // Close server and database connections
    await server.close();
    await User.sequelize.close();
    await Event.sequelize.close();
    await PlayerEvent.sequelize.close();
  });

  beforeEach(async () => {
    // Clear any session data before each test
    await agent.get('/logout');
  });

  test('Admin Signup and Login', async () => {
    // Admin signup
    const resSignup = await agent
      .post('/create-player')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: await hashPassword('adminpassword'),
        role: 'admin',
      });

    expect(resSignup.statusCode).toBe(200); // Assuming successful signup redirects to login page

    // Admin login
    const resLogin = await agent
      .post('/signinsubmit')
      .send({ email: 'admin@test.com', password: 'adminpassword' });

    expect(resLogin.statusCode).toBe(302); // Expecting redirection after login
    expect(resLogin.headers.location).toBe('/admindashboard'); // Check redirection to admin dashboard
  });

  test('Player Signup and Login', async () => {
    // Player signup
    const resSignup = await agent
      .post('/create-player')
      .send({
        firstName: 'Player',
        lastName: 'User',
        email: 'player@test.com',
        password: await hashPassword('playerpassword'),
        role: 'player',
      });

    expect(resSignup.statusCode).toBe(200); // Assuming successful signup redirects to login page

    // Player login
    const resLogin = await agent
      .post('/signinsubmit')
      .send({ email: 'player@test.com', password: 'playerpassword' });

    expect(resLogin.statusCode).toBe(302); // Expecting redirection after login
    expect(resLogin.headers.location).toBe('/playerdashboard'); // Check redirection to player dashboard
  });

  test('Admin Create Event', async () => {
    // Admin login (if not already logged in)
    await agent.post('/signinsubmit').send({ email: 'admin@test.com', password: 'adminpassword' });

    // Create event
    const resCreateEvent = await agent
      .post('/create-event')
      .send({
        title: 'Test Event',
        date: '2024-06-30',
        time: '14:00',
        venue: 'Test Venue',
        team_limit: 10,
        description: 'This is a test event',
      });

    expect(resCreateEvent.statusCode).toBe(302); // Expecting redirection after event creation
    expect(resCreateEvent.headers.location).toBe('/admindashboard'); // Check redirection to admin dashboard

    // Verify event creation in the database (optional, based on your needs)
    const events = await Event.findAll();
    expect(events.length).toBe(1); // Assuming only one event is created in this test
  });

  test('Player Join Event', async () => {
    // Player login (if not already logged in)
    await agent.post('/signinsubmit').send({ email: 'player@test.com', password: 'playerpassword' });

    // Create an event first (assuming this event exists)
    const event = await Event.create({
      title: 'Test Event',
      date: '2024-06-30',
      time: '14:00',
      venue: 'Test Venue',
      team_limit: 10,
      description: 'This is a test event',
      adminId: 1, // Replace with adminId based on your test setup
    });

    // Join event
    const resJoinEvent = await agent.post(`/join-event/${event.id}`);

    expect(resJoinEvent.statusCode).toBe(302); // Expecting redirection after joining event
    expect(resJoinEvent.headers.location).toBe('/playerdashboard'); // Check redirection to player dashboard

    // Verify player's participation in the event (optional, based on your needs)
    const playerEvents = await PlayerEvent.findAll({ where: { playerId: 1 /* Replace with playerId */, eventId: event.id } });
    expect(playerEvents.length).toBe(1); // Assuming only one player event entry is created in this test
  });

  test('Logout', async () => {
    // Login first (admin or player)
    await agent.post('/signinsubmit').send({ email: 'admin@test.com', password: 'adminpassword' });

    // Logout
    const resLogout = await agent.get('/logout');

    expect(resLogout.statusCode).toBe(302); // Expecting redirection after logout
    expect(resLogout.headers.location).toBe('/'); // Check redirection to home page
  });
});
