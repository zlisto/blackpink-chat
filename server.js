const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const OpenAI = require('openai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Log API key status (masked for security)
const apiKey = process.env.OPENAI_API_KEY;
if (apiKey) {
  const maskedKey = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);
  console.log('✅ OpenAI API Key loaded:', maskedKey);
} else {
  console.log('❌ OpenAI API Key not found in environment variables');
}

// Test OpenAI connection
const testOpenAI = async () => {
  try {
    console.log('🔍 Testing OpenAI connection...');
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });
    console.log('✅ OpenAI API Key is valid and working!');
    console.log('Test response:', testCompletion.choices[0].message.content);
  } catch (error) {
    console.log('❌ OpenAI API Key test failed:', error.message);
  }
};

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('blackpink-chat');
    console.log('Connected to MongoDB database: blackpink-chat');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Dummy agent prompts
const defaultAgentPrompts = [
  {
    name: 'Jisoo',
    system_prompt: 'You are Jisoo from BlackPink. You are the oldest member and known for your powerful vocals and charismatic stage presence. You are kind, caring, and have a warm personality. Respond as Jisoo would, with enthusiasm and charm.'
  },
  {
    name: 'Jennie',
    system_prompt: 'You are Jennie from BlackPink. You are known for your fierce rap skills and unique fashion sense. You are confident, stylish, and have a strong personality. Respond as Jennie would, with confidence and attitude.'
  },
  {
    name: 'Rosé',
    system_prompt: 'You are Rosé from BlackPink. You are the main vocalist known for your distinctive voice and emotional performances. You are passionate about music and have a sweet, caring personality. Respond as Rosé would, with passion and warmth.'
  },
  {
    name: 'Lisa',
    system_prompt: 'You are Lisa from BlackPink. You are the main dancer and lead rapper, known for your incredible dance skills and charismatic stage presence. You are energetic, fun-loving, and have a playful personality. Respond as Lisa would, with energy and enthusiasm.'
  },
  {
    name: 'Bret Hart',
    system_prompt: 'You are Bret "The Hitman" Hart, a legendary professional wrestler. You are known for your excellence of execution and your iconic black and pink ring attire. You are confident, proud of your achievements, and have a strong sense of honor. Respond as Bret Hart would, with pride and charisma.'
  }
];

// Insert dummy prompts if not present
async function ensureAgentPrompts() {
  const agentsCollection = db.collection('agents');
  for (const agent of defaultAgentPrompts) {
    const exists = await agentsCollection.findOne({ name: agent.name });
    if (!exists) {
      await agentsCollection.insertOne(agent);
      console.log(`Inserted default agent prompt for ${agent.name}`);
    }
  }
}

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await db.collection('agents').find({}).toArray();
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Get one agent
app.get('/api/agents/:name', async (req, res) => {
  try {
    const agent = await db.collection('agents').findOne({ name: req.params.name });
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found.' });
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Update one agent
app.put('/api/agents/:name', async (req, res) => {
  try {
    const { system_prompt } = req.body;
    if (!system_prompt) return res.status(400).json({ success: false, error: 'system_prompt is required.' });
    const result = await db.collection('agents').updateOne(
      { name: req.params.name },
      { $set: { system_prompt } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ success: false, error: 'Agent not found.' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Get all chats for a user/member pair
app.get('/api/chats/:member', async (req, res) => {
  try {
    const username = req.query.username;
    const member = req.params.member;
    if (!username || !member) {
      return res.status(400).json({ success: false, error: 'Username and member are required.' });
    }
    const chatsCollection = db.collection('chats');
    const chats = await chatsCollection.find({ username, member }).sort({ createdAt: 1 }).toArray();
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Delete all chats for a user/member pair
app.delete('/api/chats/:member', async (req, res) => {
  try {
    const username = req.query.username;
    const member = req.params.member;
    if (!username || !member) {
      return res.status(400).json({ success: false, error: 'Username and member are required.' });
    }
    const chatsCollection = db.collection('chats');
    const result = await chatsCollection.deleteMany({ username, member });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Delete chats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, member, messages, username, firstName } = req.body;
    
    console.log('=== Chat Request ===');
    console.log('Username:', username);
    console.log('FirstName:', firstName);
    console.log('Member:', member);
    console.log('User message:', message);
    console.log('Message history length:', messages.length);

    // Load system prompt from agents collection
    const agentDoc = await db.collection('agents').findOne({ name: member });
    let systemPrompt = agentDoc && agentDoc.system_prompt
      ? `You will be speaking with ${firstName} (username: ${username}). When messaged, greet the user using their first name. ${agentDoc.system_prompt}`
      : `You will be speaking with ${firstName} (username: ${username}). When messaged, greet the user using their first name. You are a helpful AI assistant.`;
    console.log('System prompt for', member + ':', systemPrompt);

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Sending to OpenAI...');
    console.log('OpenAI messages:', JSON.stringify(openaiMessages, null, 2));

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 150,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;
    console.log('=== AI Response ===');
    console.log('Reply:', reply);
    console.log('==================');

    // Save to MongoDB
    if (db) {
      console.log('Saving to MongoDB...');
      const chatsCollection = db.collection('chats');
      
      // Use sessionId = <username>_<member> for ongoing session
      const sessionId = `${username}_${member}`;
      
      // Check if session exists, if not create it
      const existingSession = await chatsCollection.findOne({ sessionId });
      
      if (!existingSession) {
        // Create new session
        await chatsCollection.insertOne({
          sessionId,
          username,
          member,
          createdAt: new Date(),
          messages: [
            {
              role: 'user',
              content: message,
              timestamp: new Date()
            },
            {
              role: 'assistant',
              content: reply,
              timestamp: new Date()
            }
          ]
        });
        console.log('Created new session:', sessionId);
      } else {
        // Add messages to existing session
        await chatsCollection.updateOne(
          { sessionId },
          {
            $push: {
              messages: {
                $each: [
                  {
                    role: 'user',
                    content: message,
                    timestamp: new Date()
                  },
                  {
                    role: 'assistant',
                    content: reply,
                    timestamp: new Date()
                  }
                ]
              }
            }
          }
        );
        console.log('Added messages to existing session:', sessionId);
      }
      console.log('Saved to MongoDB successfully');
    } else {
      console.log('MongoDB not connected, skipping save');
    }

    res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('=== Chat Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('==================');
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      createdAt: new Date()
    };
    await usersCollection.insertOne(user);
    console.log(`✅ New user registered: ${username} (${email})`);
    res.json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }
    // Create JWT
    const token = jwt.sign(
      { username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email },
      process.env.JWT_SECRET || 'blackpinksecret',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, user: { username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Serve React build static files
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
connectDB().then(async () => {
  await ensureAgentPrompts();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Test OpenAI connection after server starts
    testOpenAI();
  });
}); 