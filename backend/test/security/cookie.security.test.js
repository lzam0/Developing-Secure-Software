import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from '../helpers/createTestApp.js';
import { validToken, wrongSecretToken, TEST_SECRET } from '../helpers/tokenFactory.js';

// Helper: POST /auth/signin and return the raw Set-Cookie string
async function getSetCookieHeader(app) {
    const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'testuser@example.com', password: 'Password123' });
    expect(res.status).to.equal(200);
    const setCookie = res.headers['set-cookie'];
    return Array.isArray(setCookie) ? setCookie[0] : setCookie;
}

// ---------------------------------------------------------------------------
// Cookie Security Flags
// ---------------------------------------------------------------------------
describe('Cookie Security — Flags (non-production)', () => {
    let app;

    before(() => {
        process.env.NODE_ENV = 'test';
        app = createTestApp({ secret: TEST_SECRET });
    });

    it('Set-Cookie header should include the HttpOnly directive', async () => {
        const cookieStr = await getSetCookieHeader(app);
        expect(cookieStr.toLowerCase()).to.include('httponly');
    });

    it('Set-Cookie header should include SameSite=Strict', async () => {
        const cookieStr = await getSetCookieHeader(app);
        expect(cookieStr.toLowerCase()).to.include('samesite=strict');
    });

    it('Secure flag should NOT be present when NODE_ENV is not production', async () => {
        const cookieStr = await getSetCookieHeader(app);
        const directives = cookieStr.split(';').map(p => p.trim().toLowerCase());
        expect(directives).to.not.include('secure');
    });

    it('Max-Age should equal 7200 seconds (2 hours)', async () => {
        const cookieStr = await getSetCookieHeader(app);
        const match = cookieStr.match(/max-age=(\d+)/i);
        expect(match).to.not.be.null;
        expect(parseInt(match[1], 10)).to.equal(7200);
    });

    it('Cookie should be named "token"', async () => {
        const cookieStr = await getSetCookieHeader(app);
        expect(cookieStr).to.match(/^token=/);
    });
});

describe('Cookie Security — Flags (production)', () => {
    let app;
    const originalEnv = process.env.NODE_ENV;

    before(() => {
        process.env.NODE_ENV = 'production';
        app = createTestApp({ secret: TEST_SECRET });
    });

    after(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it('Secure flag should be present when NODE_ENV is production', async () => {
        const cookieStr = await getSetCookieHeader(app);
        const directives = cookieStr.split(';').map(p => p.trim().toLowerCase());
        expect(directives).to.include('secure');
    });
});

// ---------------------------------------------------------------------------
// XSS Cookie Theft Simulation
// ---------------------------------------------------------------------------
describe('Cookie Security — XSS Theft Simulation', () => {
    let app;

    before(() => {
        process.env.NODE_ENV = 'test';
        app = createTestApp({ secret: TEST_SECRET });
    });

    it('HttpOnly directive is present on the wire, preventing JS document.cookie access', async () => {
        // The browser enforces HttpOnly from this header — no JS can read the cookie
        const cookieStr = await getSetCookieHeader(app);
        expect(cookieStr.toLowerCase()).to.include('httponly');
    });

    it('should not leak the raw JWT value in the /auth/signin response body', async () => {
        const res = await request(app)
            .post('/auth/signin')
            .send({ email: 'testuser@example.com', password: 'Password123' });
        const bodyStr = JSON.stringify(res.body);
        // JWTs always start with eyJ (base64url of {"alg":...}) — if present, the token leaked
        const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/;
        expect(jwtPattern.test(bodyStr)).to.equal(false);
    });

    it('401 response body should not expose token contents or internal details', async () => {
        const res = await request(app)
            .get('/api/protected');
        expect(res.status).to.equal(401);
        const bodyStr = JSON.stringify(res.body).toLowerCase();
        expect(bodyStr).to.not.include('secret');
        expect(bodyStr).to.not.include('eyj');
    });

    it('403 response body should return a generic message without JWT library internals', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${wrongSecretToken()}`);
        expect(res.status).to.equal(403);
        // Must be the generic message, not something like "invalid signature" from jsonwebtoken
        expect(res.body.message).to.equal('Invalid or expired token');
        const bodyStr = JSON.stringify(res.body).toLowerCase();
        expect(bodyStr).to.not.include('secret');
        expect(bodyStr).to.not.include('algorithm');
    });
});

// ---------------------------------------------------------------------------
// CSRF Protection via SameSite=Strict
// ---------------------------------------------------------------------------
describe('Cookie Security — CSRF Protection (SameSite=Strict)', () => {
    let app;

    before(() => {
        process.env.NODE_ENV = 'test';
        app = createTestApp({ secret: TEST_SECRET });
    });

    it('Set-Cookie header should declare SameSite=Strict', async () => {
        const cookieStr = await getSetCookieHeader(app);
        expect(cookieStr.toLowerCase()).to.include('samesite=strict');
    });

    it('cross-origin request with no cookie should return 401 (browser withholds cookie on cross-origin)', async () => {
        // SameSite=Strict means the browser will not attach the cookie to cross-origin navigations
        const res = await request(app)
            .get('/api/protected')
            .set('Origin', 'https://evil-attacker.com');
        expect(res.status).to.equal(401);
    });

    it('cross-origin request with a forged cookie should return 403', async () => {
        // An attacker who somehow injects a cookie still cannot forge a valid JWT
        const res = await request(app)
            .get('/api/protected')
            .set('Origin', 'https://evil-attacker.com')
            .set('Cookie', 'token=forged.jwt.value');
        expect(res.status).to.equal(403);
    });

    it('same-origin request with a valid cookie should return 200 (SameSite is not over-blocking)', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${validToken()}`);
        expect(res.status).to.equal(200);
    });
});
