import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from '../helpers/createTestApp.js';
import {
    validToken,
    wrongSecretToken,
    tamperedPayloadToken,
    algNoneToken,
    emptySignatureToken,
    expiredToken,
    nearExpiryToken,
    tamperedExpToken,
    TEST_SECRET,
    WRONG_SECRET
} from '../helpers/tokenFactory.js';

const app = createTestApp({ secret: TEST_SECRET });

// ---------------------------------------------------------------------------
// Token Generation
// ---------------------------------------------------------------------------
describe('JWT Security — Token Generation', () => {

    it('should produce a token with three dot-separated base64url segments', () => {
        const token = validToken();
        expect(token).to.match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });

    it('decoded payload should contain the correct id and username claims', () => {
        const token = validToken({ id: 42, username: 'alice' });
        const decoded = jwt.decode(token);
        expect(decoded).to.include({ id: 42, username: 'alice' });
    });

    it('decoded header should declare alg HS256 (not none or a weak algorithm)', () => {
        const token = validToken();
        const decoded = jwt.decode(token, { complete: true });
        expect(decoded.header.alg).to.equal('HS256');
    });

    it('exp - iat should equal approximately 7200 seconds (2 hours)', () => {
        const token = validToken();
        const { iat, exp } = jwt.decode(token);
        expect(exp - iat).to.be.closeTo(7200, 5);
    });

    it('two tokens generated at different times should not be identical strings', async () => {
        // JWT iat has second-level precision, so we wait >1s to get a different iat value
        const first = validToken();
        await new Promise(r => setTimeout(r, 1100));
        const second = validToken();
        expect(first).to.not.equal(second);
    });

    it('a token signed with TEST_SECRET should be rejected when verified with WRONG_SECRET', () => {
        const token = validToken();
        expect(() => jwt.verify(token, WRONG_SECRET)).to.throw();
    });
});

// ---------------------------------------------------------------------------
// Token Tampering
// ---------------------------------------------------------------------------
describe('JWT Security — Token Tampering', () => {

    it('should accept a correctly signed JWT cookie (baseline)', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${validToken()}`);
        expect(res.status).to.equal(200);
    });

    it('should reject a JWT whose payload was modified without re-signing', async () => {
        const token = tamperedPayloadToken(p => { p.id = 9999; p.username = 'admin'; });
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${token}`);
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Invalid or expired token');
    });

    it('should reject a JWT signed with a different secret (wrong key attack)', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${wrongSecretToken()}`);
        expect(res.status).to.equal(403);
    });

    it('should reject an alg:none JWT (algorithm confusion attack)', async () => {
        // jsonwebtoken@9 blocks this by default — this test documents that the defense is active.
        // If this test starts failing with 200, someone passed algorithms: ["none"] to jwt.verify().
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${algNoneToken()}`);
        expect(res.status).to.equal(403);
    });

    it('should reject a JWT with an empty signature segment', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${emptySignatureToken()}`);
        expect(res.status).to.equal(403);
    });

    it('should reject a completely malformed token string', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', 'token=notavalidjwtatall');
        expect(res.status).to.equal(403);
    });

    it('should reject a JWT with only two dot-separated segments (missing signature)', async () => {
        const real = validToken();
        const parts = real.split('.');
        const truncated = `${parts[0]}.${parts[1]}`;
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${truncated}`);
        expect(res.status).to.equal(403);
    });
});

// ---------------------------------------------------------------------------
// Token Expiration
// ---------------------------------------------------------------------------
describe('JWT Security — Token Expiration', () => {

    it('should reject an expired JWT with status 403', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${expiredToken()}`);
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Invalid or expired token');
    });

    it('should accept a JWT that is near expiration but not yet expired', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${nearExpiryToken()}`);
        expect(res.status).to.equal(200);
    });

    it('should reject a JWT whose exp claim was altered (signature mismatch)', async () => {
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${tamperedExpToken()}`);
        expect(res.status).to.equal(403);
    });

    it('should return 401 when no cookie is present (simulates cookie maxAge expiry)', async () => {
        const res = await request(app)
            .get('/api/protected');
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Access token required');
    });
});

// ---------------------------------------------------------------------------
// Token Replay and Logout
// ---------------------------------------------------------------------------
describe('JWT Security — Token Replay and Logout', () => {

    it('documents that a logged-out JWT can still be replayed (known gap — no server-side denylist)', async () => {
        // Get a valid token via sign-in
        const loginRes = await request(app)
            .post('/auth/signin')
            .send({ identifier: 'testuser', password: 'Password123' });
        const rawCookie = loginRes.headers['set-cookie'][0];
        const cookieForRequest = rawCookie.split(';')[0]; // "token=eyJ..."

        // Simulate logout
        await request(app)
            .post('/auth/signout')
            .set('Cookie', cookieForRequest);

        // Replay the old token — stateless JWT means server cannot block it without a denylist
        // TODO: When a token denylist is added, flip this assertion to expect(res.status).to.equal(401)
        const replayRes = await request(app)
            .get('/api/protected')
            .set('Cookie', cookieForRequest);
        expect(replayRes.status).to.equal(200); // Known gap: no server-side invalidation
    });

    it('should return 401 when no cookie is sent after signout', async () => {
        const signoutRes = await request(app)
            .post('/auth/signout');
        expect(signoutRes.status).to.equal(200);

        // Request without any cookie — simulates browser honouring clearCookie
        const res = await request(app)
            .get('/api/protected');
        expect(res.status).to.equal(401);
    });

    it('should return 401 when token is passed in Authorization header instead of cookie', async () => {
        // The middleware only reads req.cookies?.token — Authorization header is ignored entirely
        const res = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${validToken()}`);
        expect(res.status).to.equal(401);
    });
});
