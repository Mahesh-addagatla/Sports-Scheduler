# 🏅 Sports Management System

A web-based **Sports Management System** built using **Node.js**, **Express.js**, **Sequelize ORM**, **Passport.js**, and **EJS**. This platform enables administrators to manage sports and sessions while allowing players to join available sessions. Security features like authentication, authorization, password hashing, and CSRF protection are implemented.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- **User Roles**: Sign up as an **Administrator** or **Player**
- **Authentication**: Email/password login via **Passport.js**
- **Authorization**: Route-level protection based on user roles

### 🛠️ CRUD Operations (Admin only)
- Manage sports (create, view, update, delete)
- Manage sessions associated with sports

### 👥 Player Interaction
- View all upcoming sessions
- Join sessions with team size limits enforced

### 🛡️ Security
- Passwords securely hashed with **bcrypt**
- CSRF protection using **csurf** middleware

---

---

## 🛠️ Tech Stack

| Layer         | Technology               |
|---------------|---------------------------|
| Server        | Node.js, Express.js       |
| ORM           | Sequelize                 |
| Authentication| Passport.js               |
| Database      | PostgreSQL (via Sequelize)|
| Templates     | EJS                       |
| Security      | bcrypt, csurf             |

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mahesh-addagatla/Sports-Scheduler.git
cd Sports-Scheduler

```
### 2.Install dependencies

```bash
npm install
```




### 3.Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`
`PORT`
`SESSION_SECRET`
`DB_HOST`
`DB_NAME`
`DB_USER`
`DB_PASSWORD`


### 4.Set up the database

Make sure PostgreSQL is running, then initialize tables:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

If you have seeders
```bash
npx sequelize-cli db:seed:all
```
### 5.Start the application

```bash
npm start
