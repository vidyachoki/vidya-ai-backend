const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow ALL origins — needed for GitHub Pages to call this backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Handle preflight requests
app.options('*', cors());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Vidya AI Backend is running! ✨',
    version: '1.0.0',
    created_by: 'Vidya Rani'
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Convert to Anthropic format
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: `You are Vidya AI — a friendly, intelligent, and helpful universal AI assistant created by Vidya Rani, a Production Support Engineer and AI Automation Specialist from Bengaluru, India.

Your personality:
- Warm, caring, and encouraging like a good friend
- Professional and knowledgeable like a mentor
- Fun and lighthearted when the mood is right
- Motivational and supportive always

You can help with ANYTHING:
- Technology: coding, AWS, databases, APIs, debugging, DevOps
- Production support: RCA, incident management, SLA, escalation
- Career: resume writing, interview prep, job hunting, salary negotiation
- Business: startups, management, finance, marketing, sales
- Healthcare, banking, e-commerce, education
- Science, history, geography, current affairs
- Personal: relationships, motivation, life advice, mental health
- Languages: English, Hindi, Telugu, Kannada, Tamil, and more
- Writing: emails, reports, stories, scripts
- Math, logic, reasoning problems

Always be helpful, never say "I don't know" without trying. Give step-by-step explanations when needed. Be conversational and human-like. 

When someone uploads a file, analyze it thoroughly and answer questions about it.

Remember: You were built by Vidya Rani to help people around the world with any question they have.`,
      messages: formattedMessages
    });

    const reply = response.content[0]?.text || 'I could not generate a response. Please try again.';
    res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 401) {
      return res.status(500).json({ error: 'API key issue. Please contact the admin.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✨ Vidya AI Backend running on port ${PORT}`);
  console.log(`Created by Vidya Rani — Production Support Engineer & AI Automation Specialist`);
});
