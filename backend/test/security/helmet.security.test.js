import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from '../helpers/createTestApp.js';
import { TEST_SECRET } from '../helpers/tokenFactory.js';

// npx mocha test/security/helmet.security.test.js

const app = createTestApp({ secret: TEST_SECRET });

describe('Helmet security headers', () => {
    // check the content security policy (CSP) header is working 
    // stop malicious attackers injecting malicious code (xss)
    it('should set content security policy header', async () => {
        const res = await request(app).get('/api/protected');
        // check csp header exists 
        expect(res.headers['content-security-policy']).to.exist;
    });

    // instruct the browser to only execute scripts from our own origin
    // block external malicious inline scripts (xss)
    it('should block external and inline scripts by allowing only same-origin script', async () => {
        const res = await request(app).get('/api/protected');
        const csp = res.headers['content-security-policy'];
        // check csp restricts scripts to same domain only (self)
        expect(csp).to.include("script-src 'self'");
    });

    // force HTTPS only (secure), not insecure HTTP connections
    // encrypt all traffic using https 
    it('should set strict-transport-security header', async () => {
        const res = await request(app).get('/api/protected');
        // check HTTP strict transport security (HSTS) header exists for HTTPS connections
        expect(res.headers['strict-transport-security']).to.exist;
    });

    // header set to nosniff and the browser guessing content type of a file 
    // malicious attackers disguising executable code as something else
    // e.g. treat an image/jpeg only as an image
    it('should set x-content-type-options to nosniff', async () => {
        const res = await request(app).get('/api/protected');
        expect(res.headers['x-content-type-options']).to.equal('nosniff');
    });
});