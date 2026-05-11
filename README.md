# 💬 Real-Time Chat API

A real-time chat backend built with **Spring Boot**, designed to support instant messaging, user authentication, and room-based communication.

---

## 🚀 Features

### 🔐 Authentication
- User registration and login system
- Secure password encryption using BCrypt
- JWT-based authentication for protected endpoints

---

### 💬 Real-Time Chat
- Real-time messaging between users
- Instant message delivery

---

### 🏠 Chat Rooms
- Public chat rooms
- Private rooms (invite-based)
- Users can join and switch between different rooms

---

### 👥 User System
- User registration and profile management
- Authentication via email/username
- Secure session handling with JWT tokens

---

## 🛠️ Tech Stack

- Java 17+
- Spring Boot
- Spring Security
- Spring Data JPA
- MySQL / PostgreSQL
- WebSockets (for real-time communication)
- JWT (authentication)

---

## 📡 API Overview

### Auth
- `POST /auth/register` → Register new user
- `POST /auth/login` → Login and receive JWT token

### Chat
- `WebSocket /ws` → Real-time messaging endpoint

### Rooms
- `GET /rooms` → Get available chat rooms
- `POST /rooms` → Create new room
- `POST /rooms/{id}/join` → Join a room

---

## 🔒 Security

- Passwords are encrypted using BCrypt
- JWT tokens are required for protected endpoints
- Public and private routes are separated via Spring Security configuration

---

## 📦 Project Structure
