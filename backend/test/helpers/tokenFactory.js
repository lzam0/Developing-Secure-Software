import jwt from 'jsonwebtoken';

export const TEST_SECRET = 'test-secret-for-testing-only';
export const WRONG_SECRET = 'attacker-controlled-secret-xyz';

/** Correctly signed token using the test secret. */
// export function validToken(payload = { id: 1, username: 'testuser' }, options = {}) {
//     return jwt.sign(payload, TEST_SECRET, { expiresIn: '2h', ...options });
// }

export function validToken(payload = { id: 1, username: 'testuser' }, options = {}) {
    const finalPayload = { jti: 'test-jti-123', ...payload };
    return jwt.sign(finalPayload, TEST_SECRET, { expiresIn: '2h', ...options });
}

/** Token signed with an attacker-controlled secret — simulates stolen/forged token. */
export function wrongSecretToken(payload = { id: 1, username: 'testuser' }) {
    return jwt.sign(payload, WRONG_SECRET, { expiresIn: '2h' });
}

/**
 * Tampered token: valid header + mutated payload + ORIGINAL signature.
 * The signature no longer matches the new payload, so jwt.verify() rejects it.
 * mutateFn receives the decoded payload object and can modify it in place.
 */
export function tamperedPayloadToken(mutateFn) {
    const token = validToken();
    const [headerB64, payloadB64, signature] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    mutateFn(payload);
    const newPayloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${headerB64}.${newPayloadB64}.${signature}`;
}

/**
 * alg:none attack — header declares no signature algorithm, empty third segment.
 * jsonwebtoken@9 rejects this unless verify() is called with algorithms: ['none'].
 * The current middleware never passes that option, so this is blocked by default.
 */
export function algNoneToken(payload = { id: 1, username: 'testuser' }) {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7200
    })).toString('base64url');
    return `${header}.${body}.`; // empty signature
}

/** Valid header and payload segments, but empty signature — structurally three parts. */
export function emptySignatureToken() {
    const real = validToken();
    const parts = real.split('.');
    return `${parts[0]}.${parts[1]}.`;
}

/** Validly signed token whose exp claim is 1 hour in the past. */
export function expiredToken() {
    return jwt.sign(
        { id: 1, username: 'testuser', jti: 'expired-jti-123', exp: Math.floor(Date.now() / 1000) - 3600 },
        TEST_SECRET
    );
}

/** Validly signed token with only 30 seconds remaining — should still be accepted. */
export function nearExpiryToken() {
    return jwt.sign(
        { id: 1, username: 'testuser', jti: 'near-expiry-jti-123', exp: Math.floor(Date.now() / 1000) + 30 },
        TEST_SECRET
    );
}

/**
 * Token with exp bumped far into the future WITHOUT re-signing.
 * Payload is altered so the original signature no longer matches.
 */
export function tamperedExpToken() {
    return tamperedPayloadToken(p => { p.exp = Math.floor(Date.now() / 1000) + 999999; });
}
