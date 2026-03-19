# Developing Secure Software Health and Lifestyle Applicaton

A simple full-stack web application built with **Node.js**, **Express**, **PostgreSQL**, and a **HTML/CSS frontend**.

---

# Features

* Node.js backend API
* Express server
* PostgreSQL database integration
* REST API endpoints
* HTML + CSS frontend interface
* Environment variable configuration
* Automatic development server reload

---

# Tech Stack

Backend

* Node.js
* Express
* PostgreSQL
* dotenv

Frontend

* HTML
* CSS
* JavaScript (Fetch API)

Development Tools

* Nodemon

---

# Project Structure

```
project-root
│
├── server
│   ├── server.ts
│   ├── routes/             → Define API endpoints
│   ├── controllers/        → Handle HTTP requests/ responses
│   ├── middleware/         → Auth, validation, error handling
│   ├── services/           → Business logic (CRUD operations, validation)
│   ├── db/                 → Database connection and queries
│   ├── node_modules/
│   ├── package.json
│   ├── tsconfig.json
│
├── client
│   ├── index.html
│   └── styles.css
│
├── .env
└── README.md
```

---

# Installation

Clone the repository

```
git clone <repository-url>
cd project-name
```

Install dependencies

```
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

Example configuration:

```
# Serber Configuration
PORT = 5000

# Database Details
DB_USER=postgres
DB_HOST=localhost
DB_NAME=health-blog-app
DB_PASSWORD=mypassword
DB_PORT=5432

# JWT Secret Key
JWT_WEB_TOKEN_SECRET=your_jwt_secret_key

# SALT AND PEPPER ROUNDS FOR ENCRYPTION
SALT_ROUNDS=10
PEPPER=10
```

---

# Database Setup

The PostgreSQL database runs inside a Docker container.

To run the database install *Docker https://www.docker.com/

---

# Running the Application

Start the database container
```
npm run db
```

Start the development server

```
cd server
```

``` npm install
```

```
npm run dev
```

The server will start at:

```
http://localhost:5000
```

---

# Frontend

The frontend is located inside the **public** directory and includes:

* Basic HTML interface
* CSS styling


