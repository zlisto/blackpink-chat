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
   ```