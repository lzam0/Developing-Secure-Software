# Login System Design

## Overview

The authentication system uses JSON Web Tokens (JWT) stored in HTTP-only cookies to securely authenticate users. This approach was selected over traditional session authentication to support stateless API design, improve scalability, and reduce server-side session storage requirements.

The system follows secure authentication practices including:

- Password hashing using bcrypt
- JWT expiration policies
- HTTP-only secure cookies
- CSRF mitigation via SameSite policies
- Input validation and sanitisation

## Authentication Flow

The login process follows these steps:

1. User submits email and password
2. Server validates input format
3. Server retrieves user record
4. Password compared using bcrypt
5. JWT generated if valid
6. JWT stored in HTTP-only cookie
7. User authenticated for future requests

Request flow after login:

Browser request
→ Cookie automatically sent
→ JWT verified by middleware
→ User authorised
→ API response returned

## Authentication Technology Choice

JWT authentication was selected because:

Stateless design:
JWT removes the need for server-side session storage.

Security:
Signed tokens prevent tampering.

Expiration control:
Tokens automatically expire reducing attack window.

API compatibility:
JWT works naturally with REST APIs.

Scalability:
Multiple backend servers can verify tokens without shared session storage.

## Future Security Improvements

Possible improvements include:

Refresh tokens:
Allow short-lived access tokens.

Rate limiting:
Prevent brute force login attempts.

Account lockout:
Prevent repeated login attempts.

2FA:
Add multi-factor authentication.

Token rotation:
Invalidate stolen refresh tokens.