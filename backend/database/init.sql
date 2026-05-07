-- Create User Table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
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
INSERT INTO users (username, email, password, is_verified) 
VALUES
('testuser', 'testuser@example.com', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('leihl', 'psh22xtu@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('katrina', 'k.cuevas@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('chantelle', 'chantelle.todd@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('aman', 'aman.dosanjh@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE),
('dylan', 'dylan.young@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG
