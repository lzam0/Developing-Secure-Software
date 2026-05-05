import { expect } from "chai";
import request from 'supertest';
import { createTestApp } from "../helpers/createTestApp.js";
import { TEST_SECRET, validToken } from '../helpers/tokenFactory.js';

// npx mocha test/security/sanitise.security.test.js

const app = createTestApp({ secret: TEST_SECRET });

describe('Input sanitisation', () => {
    it('should strip script tags from request body', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-001'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({ content: '<script>alert(1)</script>hello' });
        
        console.log('status', res.status);
        console.log('body', res.body);
        console.log('content field: ', res.body.content);

        // expect a 200 as the script should be taken out, left with hello
        expect(res.status).to.equal(200);
        expect(res.body.content).to.equal('hello');
        expect(res.body.content).to.not.include('<script>');
    });

    it('should leave plain text unchanged', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-002'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({ content: 'Normal blog post' });
        
        expect(res.status).to.equal(200);
        expect(res.body.content).to.equal('Normal blog post');
    });

    it('should strip onerror xss', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-003'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({ content: '<img src=x onerror=alert(1)>'});
        
        expect(res.status).to.equal(200);
        expect(res.body.content).to.equal('');
        expect(res.body.content).to.not.include('onerror');
    });

    it('should strip javascript from input', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-004'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({ content: '<a href="javascript:alert(1)">link here</a>'});
        
        expect(res.status).to.equal(200);
        expect(res.body.content).to.not.include('javascript:');
    });

    it('should sanitise all fields in the request body', async () => {
        const token = validToken({ id: 1, username: 'testuser', jti: 'sanitise-test-005'});

        const res = await request(app)
            .post('/test/echo')
            .set('Cookie', `token=${token}`)
            .send({
                title: '<script>steal()</script>My post',
                content: '<img onerror=alert(1)>My content',
                author: 'testuser'
            });
    });
})