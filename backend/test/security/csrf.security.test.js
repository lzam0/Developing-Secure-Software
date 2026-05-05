import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from '../helpers/createTestApp.js';
import { validToken } from '../helpers/tokenFactory.js';
import { validateCSRF } from '../../middleware/csrf.middleware.js';

const app = createTestApp();

describe('CSRF Protection', () => {

    it('should return 403 with no CSRF token', async () => {
        const res = await request(app).post('/api/csrf-protected');
        expect(res.status).to.equal(403);
    });

    it('should accept matching cookie and header CSRF token', async () => {
        const res = await request(app).post('/api/csrf-protected')
        .set('Cookie', 'csrfToken=abc123testtoken')
        .set('X-CSRF-Token', 'abc123testtoken');
        expect(res.status).to.equal(200);
    });

    it('should return 403 with non-matching tokens', async () => {
        const res = await request(app).post('/api/csrf-protected')
        .set('Cookie', 'csrfToken=abc123testtoken')
        .set('X-CSRF-Token', 'nonmatchingtoken');
        expect(res.status).to.equal(403);
    });

    it('should return 403 with missing cookie', async () => {
        const res = await request(app).post('/api/csrf-protected')
        .set('X-CSRF-Token', 'abc123testtoken');
        expect(res.status).to.equal(403);
    });

    it('should accept GET request with no CSRF token', async () => {
        const res = await request(app).get('/api/csrf-protected');
        expect(res.status).to.equal(200);
    })

});