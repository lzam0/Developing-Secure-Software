-- Create User Table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
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
    content TEXT NOT NULL,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE
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

-- INSERT TEST USER
--- PASSWORD IS "123" WITH BCRYPT HASH + PEPPER + SALT_ROUNDS 10
INSERT INTO users (username, email, password, is_verified) 
VALUES ('testuser', 'testuser@example.com', '$2b$10$fDSL3cnzumMLE2Sv58EH2ulcWlbdHlfzxE2lqPbZtk0wEqtXbmBHi', TRUE);