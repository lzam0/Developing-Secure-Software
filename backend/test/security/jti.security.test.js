import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from '../helpers/createTestApp.js';
import { validToken, TEST_SECRET } from '../helpers/tokenFactory.js';
import { AuthService } from '../../service/auth.service.js';
import jwt from 'jsonwebtoken';

// npx mocha test/security/jti.security.test.js

const app = createTestApp({ secret: TEST_SECRET });

describe('JTI blacklist', () => {
    // valid token with a unique jti is accepted 
    // blacklist check to ensure it isnt blocking legitmate users to the blog
    it('should allow a token if its jti is not in the blacklist', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'fresh-token-001' });
        
        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${token}`);
        // expect a 200 as the jti should not be in the revoked_tokens table (blacklist)
        expect(res.status).to.equal(200);
    });
    
    // manually insert a jti into the blacklist and try to use it 
    // check if the authenticateToken (middleware) is correctly querying the database 
    it('should reject a token if its jti has been blacklisted', async () => {
        const jti = 'stolen-token-999';
        const token = validToken({ id: 1, username: 'testuser', jti: jti });
        // simulate a token being revoked 
        const expiresAt = new Date(Date.now() + 7200000); // 2hrs 
        await AuthService.revokeToken(jti, 1, expiresAt);

        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${token}`);
        // expect a 401 unauthorised as the jti should be in the blacklist 
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Token has been revoked');
    });

    // user logs in -> user logs out -> old token should be unsuable 
    it('should blacklist a token during the signout process', async () => {
        // sign in to generate a session to get a valid token
        const loginRes = await request(app)
            .post('/auth/signin')
            .send({ identifier: 'testuser', password: 'Password123'});

        // extract the jwt from the set-cookie header
        const cookie = loginRes.headers['set-cookie'][0].split(';')[0];

        // sign out should add the tokens jti to the revoked list
        const signoutRes = await request(app)
            .post('/auth/signout')
            .set('Cookie', cookie);
        expect(signoutRes.status).to.equal(200);

        // use the old cookie after logging out, it should be rejected by the jti check
        const replayRes = await request(app)
            .get('/api/protected')
            .set('Cookie', cookie);
        // expect a 401 unauthorised as the jti should be in the blacklist
        expect(replayRes.status).to.equal(401);
        expect(replayRes.body.message).to.equal('Token has been revoked');
    });

    // token requires a jti for all protected requests 
    it('should reject a token that is missing a jti', async () => {
        // jwt payload without a jti 
        const token = jwt.sign({ id: 1, username: 'testuser' }, TEST_SECRET, { expiresIn: '2h' });

        const res = await request(app) 
            .get('/api/protected')
            .set('Cookie', `token=${token}`);
        // expect a 401 unauthorised 
        expect(res.status).to.equal(401);
        expect(res.body.message).to.contain('Invalid token: missing jti');
    });

    // a jti should be blocked even with a different user id 
    // prevent attackers from reusing a jti on a different account
    it('should reject a blacklisted jti even with a different userid', async () => {
        const jti = 'blacklisted-jti-abc';
        // authservice to manually add the jti to the revoked list for user 1 
        await AuthService.revokeToken(jti, 1, new Date(Date.now() + 3600000));
        // malicious token using the revoked jti but under user 18
        const maliciousToken = validToken({ id: 18, username: 'attacker', jti: jti });

        const res = await request(app)
            .get('/api/protected')
            .set('Cookie', `token=${maliciousToken}`);
        // expect a 401 unauthorised 
        expect(res.status).to.equal(401);
    });
});

