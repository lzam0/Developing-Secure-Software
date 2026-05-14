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
http://localhost:PORT
```

---

# Frontend

The frontend is located inside the **public** directory and includes:

* Basic HTML interface
* CSS styling

---

# Page Access

Pages are split into two categories based on whether a valid session (JWT cookie) is required.

Authentication is enforced client-side via `client/js/verify.js` (defines `verifyAuth()`) and `client/js/auth-guard.js` (redirects to `/login.html` if the session is invalid). All pages load `verify.js` first to check session state and update the navbar accordingly.

### Protected — requires a valid session

| Page | File |
|------|------|
| My Account | `client/account.html` |
| Health Metrics Tracker | `client/health-metrics-tracker.html` |
| Health Diary | `client/healthdiary.html` |
| Medication Tracker | `client/medication-tracker.html` |
| New Blog Post | `client/newBlog.html` |
| Payment | `client/payment.html` |

Unauthenticated users who navigate to any of these pages are automatically redirected to `/login.html`.

### Public — no session required

| Page | File | Notes |
|------|------|-------|
| Home | `client/index.html` | Redirects to `/blogListingPage.html` if already logged in |
| Login | `client/login.html` | |
| Sign Up | `client/signup.html` | |
| Two-Factor Auth | `client/2fa.html` | Shown mid-login flow before session is established |
| Blog Listing | `client/blogListingPage.html` | |
| Blog Post | `client/blogPage.html` | |