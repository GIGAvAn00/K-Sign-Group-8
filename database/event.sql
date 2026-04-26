CREATE DATABASE IF NOT EXISTS ksign_db_new;
USE ksign_db_new;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'fan') NOT NULL DEFAULT 'fan',
    profile_image VARCHAR(255) DEFAULT 'image/K-Sign Logo.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(200) NOT NULL,
    status ENUM('Open', 'Soon', 'Closed') NOT NULL DEFAULT 'Open',
    image VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    ticket_type VARCHAR(100) NOT NULL,
    attendees_count INT NOT NULL DEFAULT 1,
    fan_message TEXT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

INSERT INTO users (user_id, first_name, last_name, full_name, username, email, password, role, profile_image)
VALUES (
    'ADMIN-001',
    'K-Sign',
    'Administrator',
    'K-Sign Administrator',
    'admin',
    'admin@ksign.com',
    '$2y$10$w4iP8Bf5wz0Ew6m7SgkqYuXv0Wj2Qj4A1C1Qm9Q6jKxQ8C7W6bP4S',
    'admin',
    'image/K-Sign Logo.png'
);