# Secure Health and Lifestyle Application

A full-stack health and lifestyle web app built with security as a core requirement. Users can track health metrics, medication, and a personal health diary, and read or publish blog posts. The app uses JWT session cookies, two-factor authentication, and salted and peppered password hashing.

Built with **Node.js**, **Express**, **PostgreSQL** (in Docker), and a plain **HTML/CSS/JavaScript** frontend.

---

## Features

* **Health Metrics Tracker:** log and review personal health data
* **Medication Tracker:** keep track of medications
* **Health Diary:** private journal entries
* **Blog:** public blog listing and posts; logged-in users can publish
* **Account management and payment pages**
* **Authentication:** sign-up, login, and two-factor authentication

---

## Security

Security was the main focus of this project. The following controls are implemented:

* **Password hashing with salt and pepper:** passwords are never stored in plain text. Each password is hashed with a per-user salt (configurable cost via `SALT_ROUNDS`) plus a server-side pepper (`PEPPER`) kept out of the database, so a leaked database alone is not enough to crack passwords.
* **JWT-based sessions in cookies:** after login, the server issues a signed JSON Web Token (signed with `JWT_WEB_TOKEN_SECRET`) and stores it in a cookie, not in `localStorage`.
* **Two-factor authentication (2FA):** login is a two-step flow. After a correct password, the user must complete a second verification step (`2fa.html`) before a session is created.
* **Protected routes:** pages holding personal health data (account, metrics, diary, medication, payment, new blog post) require a valid session. Unauthenticated users are redirected to the login page (see [Page Access](#page-access)).
* **Secrets in environment variables:** database credentials, the JWT secret, and the hashing pepper are loaded from a `.env` file with `dotenv` and are never committed to the repository.

---

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, dotenv

**Frontend:** HTML, CSS, JavaScript (Fetch API)

**Tooling:** Docker (database), Nodemon (dev server auto-reload)

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/)
* [Docker](https://www.docker.com/) (the PostgreSQL database runs in a container)

### Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server configuration
PORT=5000

# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=health-blog-app
DB_PASSWORD=mypassword
DB_PORT=5432

# JWT secret key
JWT_WEB_TOKEN_SECRET=your_jwt_secret_key

# Password hashing
SALT_ROUNDS=10
PEPPER=your_random_pepper_string
```

### Running the Application

1. Start the database container (from the project root):

   ```bash
   npm run db
   ```

2. Install server dependencies and start the development server:

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Open the app at `http://localhost:<PORT>` (e.g. `http://localhost:5000`).

---

## Frontend

The frontend lives in the **`client`** directory and is plain HTML, CSS, and JavaScript. It talks to the Express API using the Fetch API.

---

## Page Access

Pages fall into two groups depending on whether they need a valid session (JWT cookie).

Every page loads `client/js/verify.js` first. It defines `verifyAuth()`, which checks the session and updates the navbar. Protected pages also load `client/js/auth-guard.js`, which redirects to `/login.html` if the session is invalid.

### Protected (requires a valid session)

| Page | File |
|------|------|
| My Account | `client/account.html` |
| Health Metrics Tracker | `client/health-metrics-tracker.html` |
| Health Diary | `client/healthdiary.html` |
| Medication Tracker | `client/medication-tracker.html` |
| New Blog Post | `client/newBlog.html` |
| Payment | `client/payment.html` |

### Public (no session required)

| Page | File | Notes |
|------|------|-------|
| Home | `client/index.html` | Redirects to `/blogListingPage.html` if already logged in |
| Login | `client/login.html` | |
| Sign Up | `client/signup.html` | |
| Two-Factor Auth | `client/2fa.html` | Shown during login, before the session is created |
| Blog Listing | `client/blogListingPage.html` | |
| Blog Post | `client/blogPage.html` | |
