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

This application is ready for deployment on **Vercel** (recommended) or any platform that supports Next.js.

### 🚀 Deploy to Vercel (Recommended - Easiest)

**Vercel is the best choice for Next.js apps** - it's created by the Next.js team and offers seamless deployment.

#### Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - **No environment variables needed!** (Users enter their own API keys)
   - Framework Preset: **Next.js** (auto-detected)
   - Click "Deploy"
   - Wait ~2-3 minutes for deployment

3. **Your site is live!** Vercel will provide a URL like `your-app.vercel.app`

#### Important Notes:
- ✅ **No server-side API key required** - Users enter their own Gemini API keys in the app
- ✅ API keys are stored securely in users' browsers (localStorage)
- ✅ No environment variables needed to configure
- ✅ The `vercel.json` configuration file is included for optimal deployment

### Alternative: Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Click Deploy - **No environment variables needed!**

### Before Deploying:

1. ✅ Test the build locally: `npm run build`
2. ✅ Ensure `.env.local` is in `.gitignore` (won't be committed)
3. ✅ No environment variables needed - users provide their own API keys!

## License

This project is open source and available for personal use.

## Disclaimer

This assistant provides general relationship advice and is not a substitute for professional counseling, therapy, or medical advice. For serious concerns, abuse, or mental health issues, please seek help from licensed professionals.

