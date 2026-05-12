-- Create User Table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_lookup VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Adding in new fields for subscription
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create Profile Table
CREATE TABLE IF NOT EXISTS profiles (
    profileid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    name VARCHAR(255),
    age INTEGER
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS posts (
    postid SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tags VARCHAR(255)[] NOT NULL,
    content TEXT NOT NULL,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Diary Table
CREATE TABLE IF NOT EXISTS diary (
    id SERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(userid) ON DELETE CASCADE
);

-- Create OTPs Table
CREATE TABLE IF NOT EXISTS email_otps (
    otpid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Suspicious Activity Reports Table
CREATE TABLE IF NOT EXISTS suspicious_activity_reports (
    reportid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    report_token_hash VARCHAR(255) NOT NULL UNIQUE,
    purpose VARCHAR(50) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- table for invalid or logged-out session tokens 
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id SERIAL PRIMARY KEY, 
    jti TEXT NOT NULL UNIQUE, -- unique serial number from jwt
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE, -- link the token to a specific user
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL -- expiry date from the JWT 
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);

-- INSERT TEST USER
--- PASSWORD IS "123" WITH BCRYPT HASH + PEPPER + SALT_ROUNDS 10
INSERT INTO users (username, email, email_lookup, password, is_verified)
VALUES
('testuser', 'v1:a8e0c06b94159d44b0464209:dd138dca6c1f46fd2d36e2e423f1ca93:68c302b0d52d5ba899176aa8a2cc7548988c191c', '8b2a0c454ef5abf3695a46d434353de745d35a46a7e698ff354dd94bc111a8f7', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('leihl', 'v1:c8aa90bd436f03ad05b8d351:67d24b58b878a09c7142963318ab9f8b:62e769e50e23e8b566648370785dc3f69c76', '94300c0cba7926c3a359a65addc93f73b2df083e51eafd4ea23c99dae78c0ce6', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('katrina', 'v1:28dfb12790fe3b45066f478f:b29120cf93ac643536e32f55b20c57ce:1ea8a295bd4e47ca05ec54d9519edc0e1909', '16bd67fdfeb12ddf2f6487b058ef039fa5edffeeba7fa8593820003998b3f395', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('chantelle', 'v1:e7b7cbfed767bf1dc6768666:df2626be4d59289db6384c6bc126edfe:e8fdd7abda8286f20e7cf0f85aa83de0a4cf577507f3b130', '5a98d9194292ae7314d07fd710429e95bdb60f0124bb419773879d31af42c4c6', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('aman', 'v1:a1c7fc1dfd35192a9d2aae9a:57a680f01b448a63cf85eb32fd6adc99:2dc9c085499313ba2f65ffb4140627f37b1f7866f6c2', 'd9e3983529202840f4d5693c81829770a09eef8b36a6a5c6f6259973dfd77513', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('dylan', 'v1:97c710dd0fce9552c019e7d5:ca7a5b942447d9172bf1510ccb97c8eb:4cbf9c5f994b26b8b73f46f003f72b958164d40448', 'f9d3bfb932429da56450e860212ca28170379bda43f38bc22f2766a47c7099a1', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG
