# Security Roadmap

## Completed
- [x] JWT stored in HTTP-only, SameSite=Strict cookie
- [x] Token revocation blacklist (revoked_tokens table)
- [x] Password hashing with bcrypt + pepper
- [x] Anti-enumeration: generic messages on sign-up/sign-in
- [x] Anti-timing: jitter + fake hash on failed auth
- [x] Rate limiting on auth routes (10 req / 15 min)
- [x] Server-side protection for gated pages (authenticateToken before express.static)

---

## To Do

### Critical
- [ ] **Fix password regex** — current regex `/^(?=.*[A-Za-z])(?=.*\d){8,72}$/` does not enforce length. Change to `/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/`
  - `backend/service/auth.service.js:198`
  - `backend/middleware/validation.middleware.js:15`

- [ ] **Remove JWT token from sign-in response body** — token is set in cookie (good) but also returned in `data.token` in the JSON response, exposing it to any JS on the page
  - `backend/controllers/auth.controller.js:84`

### Medium
- [ ] **Fix signOut to use `jwt.verify()` instead of `jwt.decode()`** — decode skips signature check, allowing crafted cookies to pollute the revoked_tokens table
  - `backend/controllers/auth.controller.js:106`

- [ ] **Add input validation to signIn** — `validateSignIn` middleware is currently a no-op (no length limits, no type checks)
  - `backend/middleware/validation.middleware.js:31`

- [ ] **Enable `secure` cookie flag in all environments** — currently only set in production, meaning the JWT cookie can be sent over plain HTTP in dev/staging
  - `backend/controllers/auth.controller.js:80`

### Low
- [ ] **Implement real email verification** — sign-up returns "verification email sent" but no email is sent and there is no email-verified flag; users can log in immediately with unverified accounts

- [ ] **Add per-account failed login lockout** — rate limiting is IP-based only; rotating IPs can still brute-force a specific account

- [ ] **Remove dead token generation in signUp** — a JWT is generated on line 114 of `auth.service.js` but never used or returned; safe to delete

---

## Future Features
- [ ] Fetch and display user data (username, email, blog posts) on gated pages
- [ ] Full blog post CRUD with DB integration
- [ ] Health metrics DB integration
- [ ] Medication tracker DB integration
- [ ] Payment flow integration
