const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from GitHub Pages and local testing
app.use(cors({
  origin: [
    'https://vidyachoki.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'null' // for local file:// testing
  ],
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Vidya AI Backend is running! ✨',
    version: '1.0.0',
    created_by: 'Vidya Rani'
  });
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: system || 'You are Vidya, a helpful AI assistant.',
        messages: messages
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({
        error: errData?.error?.message || `API Error ${response.status}`
      });
    }

    const data = await response.json();
    const text = data.content?.find(c => c.type === 'text')?.text;

    if (!text) {
      return res.status(500).json({ error: 'No response from AI. Please try again.' });
    }

    res.json({ reply: text });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✨ Vidya AI Backend running on port ${PORT}`);
});
