'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm here to help with relationship advice, communication, and emotional support. What's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const examplePrompts = [
    "How do I communicate my needs better?",
    "How should I handle a difficult breakup?",
    "What are healthy boundaries in a relationship?",
    "How can I resolve conflicts more effectively?",
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#fff',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '1.5rem',
          backgroundColor: '#667eea',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          AI Relationship Coach
        </h1>
        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
          Compassionate advice for relationships, communication, and emotional growth
        </p>
      </header>

      {/* Disclaimer */}
      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#fff3cd',
          borderBottom: '1px solid #ffeaa7',
          fontSize: '0.875rem',
          color: '#856404',
        }}
      >
        <strong>Disclaimer:</strong> This assistant provides general relationship advice
        and is not a substitute for professional counseling, therapy, or medical advice.
        For serious concerns, please seek help from licensed professionals.
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#f8f9fa',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease-in',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '0.875rem 1.125rem',
                borderRadius: '1rem',
                backgroundColor: message.role === 'user' ? '#667eea' : '#fff',
                color: message.role === 'user' ? '#fff' : '#333',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                padding: '0.875rem 1.125rem',
                borderRadius: '1rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  animation: 'bounce 1.4s infinite ease-in-out',
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.2s',
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.4s',
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '0.5rem',
              border: '1px solid #f5c6cb',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {messages.length === 1 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#e7f3ff',
              borderRadius: '0.5rem',
              border: '1px solid #b3d9ff',
            }}
          >
            <p style={{ marginBottom: '0.75rem', fontWeight: '500', color: '#004085' }}>
              Example questions you can ask:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(prompt)}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: '#fff',
                    border: '1px solid #b3d9ff',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    color: '#004085',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b3d9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            style={{
              flex: 1,
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '120px',
              lineHeight: '1.5',
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

