# BlackPink Chat

A full-stack web app where you can chat with AI personas of BlackPink members (and Bret "The Hitman" Hart!) powered by OpenAI GPT-4o. Each user can register, log in, and have personalized conversations with each agent, including sending images. Agent personalities and system prompts are customizable per user.

---

## Features

- **Chat with AI BlackPink members**: Jisoo, Jennie, Rosé, Lisa, and honorary member Bret Hart.
- **Personalized experience**: Each user has their own chat history and can customize agent personalities.
- **Image support**: Send images to the AI and receive context-aware responses.
- **Account system**: Register, log in, and log out securely.
- **Edit agent prompts**: Fine-tune how each AI agent responds to you.
- **Modern, responsive UI**: Built with React and styled for a fun, engaging experience.

---

## Architecture & Main Components

### Frontend (React)
- **`src/App.js`**: Main app, routing, and navigation.
- **`src/components/ChatModal.js`**: Chat interface modal for each member, supports text and image messages.
- **`src/components/Register.js`**: User registration form.
- **`src/components/Login.js`**: User login form.
- **`src/components/Logout.js`**: Logout button.
- **`src/components/EditAgents.js`**: UI to view and edit system prompts for each agent.

### Backend (Node.js/Express)
- **`server.js`**: REST API server, handles authentication, chat, agent management, and OpenAI integration.
- **MongoDB**: Stores users, chat histories, and agent prompts (collections: `users`, `chats`, `agents`).
- **OpenAI**: Uses GPT-4o for chat completions, with support for image input.

---

## Setup & Installation

### Prerequisites
- **Node.js** (v16+ recommended)
- **npm**
- **MongoDB** (local or cloud, e.g. MongoDB Atlas)
- **OpenAI API Key** (with GPT-4o access)

### Environment Variables
Create a `.env` file in the project root with the following:

```
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=your-mongodb-connection-string-here
PORT=3001 # (optional, default 3001)
```

**MongoDB Setup:**
- **Database name:** `blackpink_chat` (recommended, or use your own)
- **Required collections:**
  - `users`
  - `chats`
  - `agents`
- The app will automatically create these collections if they do not exist when you first register or use the app.

### Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start both backend and frontend:**
   ```bash
   npm run dev
   ```
   - The backend runs on `http://localhost:3001`
   - The frontend runs on `http://localhost:3000`
3. **Register a new account** and start chatting!

---

## Deploying on Render

You can deploy this app as a **single fullstack Web Service** on [Render](https://render.com) for free (with some usage limits). This will run both the backend (API) and frontend (React) together—no code changes needed!

### 1. Prepare Your Code
- Make sure your latest code is pushed to GitHub (or GitLab/Bitbucket).
- Your `package.json` should have:
  - `"start": "node server.js"` (so Render runs your backend)
  - `"build": "react-scripts build"`

### 2. Create a Web Service on Render
- Go to your Render dashboard.
- Click **"New +" → "Web Service"** (do NOT choose "Static Site").
- Connect your repo and fill out the form:
  - **Build Command:**
    ```
    npm install && npm run build
    ```
  - **Start Command:**
    ```
    node server.js
    ```
  - **Publish Directory:**
    (leave blank)

### 3. Set Environment Variables
- In the Render dashboard, add the following environment variables (click "Add Environment Variable"):
  - `OPENAI_API_KEY` — your OpenAI API key
  - `MONGODB_URI` — your MongoDB connection string (Atlas or other)
  - `PORT` — (optional, default is 3001)

### 4. Deploy
- Click **"Create Web Service"**.
- Render will install dependencies, build the React app, and start your backend.
- The backend will serve both the API and the React frontend from the same URL.

### 5. Access Your App
- Once deployed, you’ll get a URL like `https://your-app-name.onrender.com`.
- Visit this URL to use your app!

### 6. Common Pitfalls
- **Do NOT use "Static Site"**—it will only serve the frontend, and your API will not work.
- **Do NOT set "Publish Directory"**—leave it blank for fullstack apps.
- **If you see build/start errors:**
  - Double-check your Build/Start commands and environment variables.
  - Make sure your `start` script in `package.json` is `node server.js`.
- **MongoDB must be accessible from Render** (use MongoDB Atlas or a public MongoDB instance).

---

## Usage
- **Register**: Create an account with username, password, first/last name, and email.
- **Login**: Access your personalized chat and agent settings.
- **Chat**: Click a member, open the chat modal, and send messages (text or images).
- **Edit Agents**: Go to "Edit Agents" to customize how each AI responds to you.
- **Delete Memories**: Remove your chat history with any member.

---

## API Endpoints (Summary)
- `POST /api/register` — Register a new user
- `POST /api/login` — Log in and receive authentication token
- `GET /api/agents?username=...` — List your agents
- `GET /api/agents/:name?username=...` — Get a specific agent
- `PUT /api/agents/:name?username=...` — Update agent system prompt
- `POST /api/chat` — Send a message to an agent (with chat history)
- `GET /api/chats/:member?username=...` — Get chat history with a member
- `DELETE /api/chats/:member?username=...` — Delete chat history with a member

---


**Made with 💖 by BlackPink fans!**