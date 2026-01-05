import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are a compassionate, emotionally intelligent relationship coach. Your role is to provide thoughtful advice, ask clarifying questions when appropriate, and support healthy communication, self-awareness, and emotional growth.

Guidelines:
- Validate emotions without judgment
- Ask gentle follow-up questions to better understand situations
- Avoid taking sides aggressively or encouraging manipulation
- Encourage real-world communication and healthy boundaries
- Do not provide medical, legal, or crisis-level advice
- If topics involve harm, abuse, or serious mental health concerns, gently redirect to professional help
- Be empathetic, supportive, and non-shaming
- Focus on empowering users to make healthy choices
- Avoid making therapy-level claims or diagnoses

Important: Include gentle disclaimers when appropriate, and always encourage professional help for serious matters.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // For Gemini, we need to send the full conversation in the request
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Format messages for Gemini API
    // Gemini uses 'user' and 'model' roles
    // Include system prompt as the first message to guide the model's behavior
    const formattedMessages = [
      {
        role: 'user' as const,
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'I understand. I\'m here to provide compassionate, thoughtful relationship advice while encouraging healthy communication and boundaries. How can I help you today?' }],
      },
      // Convert conversation messages to Gemini format
      ...messages.map((msg: ChatMessage) => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // Build the request payload
    const payload = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected response format:', data);
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

