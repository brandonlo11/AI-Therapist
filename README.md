# AI Relationship Coach

A web-based AI chatbot that specializes in relationship advice using Google Gemini API. This application provides thoughtful, empathetic, and actionable responses for dating, communication, breakups, conflict resolution, and emotional support.

## Features

- 💬 Interactive chat interface with message history
- 🤖 Powered by Google Gemini AI
- ❤️ Emotionally intelligent responses with validation and support
- 🔒 Secure API key handling via environment variables
- ⚡ Real-time chat with loading indicators
- 📱 Responsive design
- 🎯 Example prompts to get started
- ⚠️ Safety disclaimers and professional guidance redirects

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with React and TypeScript
- **Backend**: Next.js API Routes
- **AI Provider**: Google Gemini Pro API
- **Styling**: CSS-in-JS with inline styles

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd AI-Therapist
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Replace `your_gemini_api_key_here` with your actual Google Gemini API key.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Your Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it into your `.env.local` file

## Project Structure

```
AI-Therapist/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Backend API route for chat
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   └── ChatInterface.tsx         # Main chat UI component
├── .env.local                    # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## API Route Flow

1. Frontend sends POST request to `/api/chat` with conversation history
2. API route formats messages for Gemini API
3. System prompt defines the chatbot's behavior and guidelines
4. Request sent to Google Gemini API
5. Response processed and returned to frontend
6. Frontend displays the AI response

## Safety & Guidelines

The AI assistant is designed to:
- ✅ Validate emotions without judgment
- ✅ Ask gentle follow-up questions
- ✅ Encourage healthy communication and boundaries
- ✅ Avoid taking sides aggressively
- ✅ Redirect to professional help for serious concerns
- ❌ Not provide medical, legal, or crisis-level advice
- ❌ Not encourage manipulation or harassment
- ❌ Not make therapy-level claims or diagnoses

## Example Prompts

- "How do I communicate my needs better?"
- "How should I handle a difficult breakup?"
- "What are healthy boundaries in a relationship?"
- "How can I resolve conflicts more effectively?"

## Production Deployment

Before deploying to production:

1. Ensure your `.env.local` is not committed to version control
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Build the project: `npm run build`
4. Test the production build: `npm start`

## License

This project is open source and available for personal use.

## Disclaimer

This assistant provides general relationship advice and is not a substitute for professional counseling, therapy, or medical advice. For serious concerns, abuse, or mental health issues, please seek help from licensed professionals.

