import { expect } from "chai";
import request from 'supertest';
import { createTestApp } from "../helpers/createTestApp.js";
import { TEST_SECRET, validToken } from '../helpers/tokenFactory.js';

const app = createTestApp({ secret: TEST_SECRET });

describe('Input sanitisation', () => {
    it('should strip script tags from request body', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-001'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({ content: '<script>alert(1)</script>hello' });
        
        expect(res.status).to.equal(200);
        expect(res.body.content).to.equal('hello');
        expect(res.body.content).to.not.include('<script>');
    });
})