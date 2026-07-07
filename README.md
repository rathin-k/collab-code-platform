# 🚀 Collaborative Coding Platform

A full-stack **Collaborative Coding Platform** that enables multiple authenticated users to write code together in real time, communicate through an integrated chat system, and automatically save code and chat history using MongoDB.

---

## ✨ Features

- 🔐 JWT-based user authentication (Signup & Login)
- 🛡️ Protected routes for authenticated users
- 💻 Real-time collaborative code editing using Monaco Editor
- ⚡ Instant code synchronization with Socket.IO
- 💬 Real-time chat within collaboration rooms
- 👥 Online user tracking with live participant list
- 💾 Automatic code persistence using MongoDB
- 📝 Automatic chat history persistence
- 🔄 Restore previous code and chat history when users rejoin a room
- 🌐 Responsive client-server architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Context API
- Axios
- Monaco Editor
- CSS

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT (JSON Web Token)
- bcrypt

### Database
- MongoDB Atlas
- Mongoose

---

## 📁 Project Structure

```text
collab-code-platform
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── socket
│   │   └── styles
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone <repository-url>
cd collab-code-platform
```

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## ▶️ Run the Project

### Start the backend

```bash
cd server
node server.js
```

### Start the frontend

```bash
cd client
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

---

## 🚀 Future Enhancements

- ▶️ Code execution
- 📁 File sharing
- 👆 Live cursor tracking
- 🌐 Deployment (Vercel + Render)
- 🎨 Enhanced UI/UX
- 🌙 Dark/Light theme
- 📹 Video or voice collaboration

---

## 📸 Screenshots

> Screenshots will be added after the UI redesign.

---

## 👨‍💻 Author

**Rathin Kamble**

B.Tech Computer Science & Engineering

Walchand College of Engineering, Sangli