Sports Management System
This is a Sports Management System built using Node.js, Express.js, Sequelize ORM, Passport.js for authentication, and EJS for rendering views. The system allows administrators to manage sports and sessions, and players to join sessions.

Features
Authentication: Users can sign up as administrators or players, and log in securely using email and password.
Authorization: Different routes are protected based on user roles. Administrators have access to admin dashboard to manage sports and sessions, while players have access to player dashboard to view and join sessions.
CRUD Operations: Administrators can create, read, update, and delete sports and sessions.
Session Management: Players can view available sessions and join them. The system ensures team size constraints are met when joining sessions.
CSRF Protection: Cross-Site Request Forgery protection is implemented using csurf middleware.
Password Hashing: User passwords are securely hashed using bcrypt.
