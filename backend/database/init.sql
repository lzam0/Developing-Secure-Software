-- Create User Table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO users (username, email, password) 
VALUES
('testuser', 'testuser@example.com', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG'),
('leihl', 'psh22xtu@uea.ac.uk', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG'); -- Password 123
