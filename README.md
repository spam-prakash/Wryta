# ✨ Dastaan — Your Modern Note-Taking Companion

**Dastaan** is a secure and feature-rich full-stack notes application that empowers users to take notes, manage them, and interact with others' public notes. Whether you're jotting down thoughts or sharing public insights, Dastaan provides a clean UI, rich interactions, and powerful backend support to supercharge your productivity.

---
<!---
## 📸 Preview

> *Add screenshots or demo GIFs here if available*
>
> Example:
> ![Dastaan UI](./screenshots/homepage.png)

---

-->

## 🚀 Features

- 🔐 **User Authentication**  
  Secure login and registration using **JWT**.

- 📝 **Notes Management**  
  Create, read, update, and delete personal notes.

- 🌍 **Public Sharing**  
  Publish notes to the community — discoverable by others.

- ❤️ **Like/Unlike Notes**  
  Users can interact by liking public notes.

- 📋 **Copy Notes**  
  One-click copying of note content to clipboard.

- 📥 **Download Notes as Images**  
  Download visually designed note cards as PNG.

- 🔗 **Share Notes**  
  Share note links via Web Share API or clipboard.

- 📊 **Real-Time Interaction Counters**  
  Counts of likes, copies, downloads, and shares update in real time.

- 🎨 **Responsive UI**  
  Fully mobile-friendly layout using **Tailwind CSS**.

---

## 🛠️ Tech Stack

| Layer        | Technology          |
|--------------|---------------------|
| Frontend     | React.js, Tailwind CSS |
| Backend      | Node.js, Express.js |
| Database     | MongoDB with Mongoose |
| Auth         | JWT (JSON Web Tokens), Passport|
| Others       | HTML2Canvas, React Icons, Web Share API |

---

## 📁 Project Structure

Dastaan/
├── client/                    # Frontend (React)
│   ├── components/            # Reusable components
│   │   └── InteractionButtons.jsx
│   ├── pages/                 # Page components
│   │   └── Home.jsx
│   ├── App.js
│   └── ...
├── server/                    # Backend (Node + Express)
│   ├── models/                # Database models
│   │   └── Note.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── userAction.js
│   ├── controllers/           # Route handlers
│   └── index.js

---


## 🔧 Installation & Setup

### 📦 1. Clone the Repository
```bash
  git clone https://github.com/spam-prakash/Dastaan.git
  cd Dastaan
```

### 🖥️ 2. Setup Backend
```bash
cd backend
npm install
```

#### Create a .env file in backend folder:
```bash
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

#### Start the backend server:
```bash
npm run start
```

### 💻 3. Setup Frontend
```bash
cd frontend
npm install
```

#### Create a .env file in client folder:
```bash
REACT_APP_HOSTLINK=http://localhost:8000
```

#### Start the frontend app:
```bash
npm start
```

---

## Author
Built with ❤️ by Prakash Kumar

- [Github](https://github.com/spam-prakash)

- [linkedin](https://linkedin.com/in/spam-prakash)

- [X (Twitter)](https://X.com/spam_prakash)
