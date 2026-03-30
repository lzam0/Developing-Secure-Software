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

-- INSERT TEST USER
--- PASSWORD IS "123" WITH BCRYPT HASH + PEPPER + SALT_ROUNDS 10
INSERT INTO users (username, email, password) 
VALUES ('testuser', 'testuser@example.com', '$2b$10$MmMPHA3vryoI1p33LRJIMu3Pma.T5r6juHZ2o6kxAm2zglOfdw7vG');