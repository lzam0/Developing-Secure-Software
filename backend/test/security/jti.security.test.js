import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from '../helpers/createTestApp.js';
import { validToken, TEST_SECRET } from '../helpers/tokenFactory.js';
import { AuthService } from '../../service/auth.service.js';

// npx mocha test/security/jti.security.test.js

const app = createTestApp({ secret: TEST_SECRET });

describe('JTI blacklist', () => {
    // valid token with a unique jti is accepted 
    // blacklist check isnt blocking legitmate users 
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
});

