'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <div className="header-therapist-avatar">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="50" cy="35" r="18" fill="#fdbcb4" stroke="#2d3748" strokeWidth="2"/>
              {/* Body/Shirt */}
              <path d="M30 50 L30 75 L70 75 L70 50 Q70 45 65 45 L60 45 L60 50 L40 50 L40 45 L35 45 Q30 45 30 50 Z" fill="#4a90e2" stroke="#2d3748" strokeWidth="2"/>
              {/* Tie */}
              <path d="M50 50 L45 60 L50 70 L55 60 Z" fill="#2d3748"/>
              {/* Collar */}
              <path d="M40 50 L35 45 L45 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
              <path d="M60 50 L65 45 L55 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
              {/* Hair */}
              <path d="M32 25 Q35 20 40 22 Q45 20 50 22 Q55 20 60 22 Q65 20 68 25 Q65 28 60 26 Q55 28 50 26 Q45 28 40 26 Q35 28 32 25 Z" fill="#8b4513"/>
              {/* Eyes */}
              <circle cx="45" cy="32" r="2" fill="#2d3748"/>
              <circle cx="55" cy="32" r="2" fill="#2d3748"/>
              {/* Smile */}
              <path d="M42 40 Q50 45 58 40" stroke="#2d3748" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1>Relationship Coach</h1>
            <p>Your compassionate guide for relationships and emotional growth</p>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="disclaimer">
        <span className="disclaimer-icon">ℹ️</span>
        <span>
          <strong>Note:</strong> This assistant provides general relationship advice and is not a substitute for professional counseling or therapy.
        </span>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              {message.role === 'assistant' && (
                <div className="avatar assistant-avatar therapist-avatar">
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Head */}
                    <circle cx="50" cy="35" r="18" fill="#fdbcb4" stroke="#2d3748" strokeWidth="2"/>
                    {/* Body/Shirt */}
                    <path d="M30 50 L30 75 L70 75 L70 50 Q70 45 65 45 L60 45 L60 50 L40 50 L40 45 L35 45 Q30 45 30 50 Z" fill="#4a90e2" stroke="#2d3748" strokeWidth="2"/>
                    {/* Tie */}
                    <path d="M50 50 L45 60 L50 70 L55 60 Z" fill="#2d3748"/>
                    {/* Collar */}
                    <path d="M40 50 L35 45 L45 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
                    <path d="M60 50 L65 45 L55 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
                    {/* Hair */}
                    <path d="M32 25 Q35 20 40 22 Q45 20 50 22 Q55 20 60 22 Q65 20 68 25 Q65 28 60 26 Q55 28 50 26 Q45 28 40 26 Q35 28 32 25 Z" fill="#8b4513"/>
                    {/* Eyes */}
                    <circle cx="45" cy="32" r="2" fill="#2d3748"/>
                    <circle cx="55" cy="32" r="2" fill="#2d3748"/>
                    {/* Smile */}
                    <path d="M42 40 Q50 45 58 40" stroke="#2d3748" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div className={`message-bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'} ${message.role === 'assistant' ? 'therapist-bubble' : ''}`}>
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="markdown-p" {...props} />,
                      strong: ({ node, ...props }) => <strong className="markdown-strong" {...props} />,
                      em: ({ node, ...props }) => <em className="markdown-em" {...props} />,
                      ul: ({ node, ...props }) => <ul className="markdown-ul" {...props} />,
                      ol: ({ node, ...props }) => <ol className="markdown-ol" {...props} />,
                      li: ({ node, ...props }) => <li className="markdown-li" {...props} />,
                      code: ({ node, inline, ...props }: any) => 
                        inline ? (
                          <code className="markdown-code-inline" {...props} />
                        ) : (
                          <code className="markdown-code-block" {...props} />
                        ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="message-text">{message.content}</div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="avatar user-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-wrapper assistant-message">
            <div className="message-content">
              <div className="avatar assistant-avatar therapist-avatar">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Head */}
                  <circle cx="50" cy="35" r="18" fill="#fdbcb4" stroke="#2d3748" strokeWidth="2"/>
                  {/* Body/Shirt */}
                  <path d="M30 50 L30 75 L70 75 L70 50 Q70 45 65 45 L60 45 L60 50 L40 50 L40 45 L35 45 Q30 45 30 50 Z" fill="#4a90e2" stroke="#2d3748" strokeWidth="2"/>
                  {/* Tie */}
                  <path d="M50 50 L45 60 L50 70 L55 60 Z" fill="#2d3748"/>
                  {/* Collar */}
                  <path d="M40 50 L35 45 L45 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
                  <path d="M60 50 L65 45 L55 45 Z" fill="#ffffff" stroke="#2d3748" strokeWidth="1"/>
                  {/* Hair */}
                  <path d="M32 25 Q35 20 40 22 Q45 20 50 22 Q55 20 60 22 Q65 20 68 25 Q65 28 60 26 Q55 28 50 26 Q45 28 40 26 Q35 28 32 25 Z" fill="#8b4513"/>
                  {/* Eyes */}
                  <circle cx="45" cy="32" r="2" fill="#2d3748"/>
                  <circle cx="55" cy="32" r="2" fill="#2d3748"/>
                  {/* Smile */}
                  <path d="M42 40 Q50 45 58 40" stroke="#2d3748" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="message-bubble assistant-bubble therapist-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}

        {messages.length === 1 && (
          <div className="example-prompts">
            <div className="example-header">
              <span className="example-icon">💭</span>
              <h3>Example questions you can ask</h3>
            </div>
            <div className="example-list">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(prompt)}
                  className="example-button"
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
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="chat-input"
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
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
          background-color: #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-therapist-avatar {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.2);
        }

        .header-content h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .header-content p {
          font-size: 0.875rem;
          color: #718096;
          margin: 0;
        }

        .disclaimer {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #fff5e6 0%, #ffe0b3 100%);
          border-bottom: 1px solid rgba(255, 193, 7, 0.2);
          font-size: 0.8125rem;
          color: #856404;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .disclaimer-icon {
          font-size: 1rem;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-wrapper {
          display: flex;
          width: 100%;
          animation: fadeIn 0.3s ease-in;
        }

        .user-message {
          justify-content: flex-end;
        }

        .assistant-message {
          justify-content: flex-start;
        }

        .message-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          max-width: 85%;
        }

        .assistant-message .message-content {
          align-items: flex-start;
        }

        .user-message .message-content {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .therapist-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%);
          border: 2px solid rgba(102, 126, 234, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .assistant-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .user-avatar {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          line-height: 1.6;
          word-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .therapist-bubble {
          background: white;
          color: #2d3748;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-left: 3px solid #667eea;
        }

        .therapist-bubble::before {
          content: '';
          position: absolute;
          left: -10px;
          bottom: 16px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 10px solid white;
          z-index: 2;
        }

        .therapist-bubble::after {
          content: '';
          position: absolute;
          left: -12px;
          bottom: 16px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 10px solid rgba(0, 0, 0, 0.05);
          z-index: 1;
        }

        .assistant-bubble {
          background: white;
          color: #2d3748;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .user-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .message-text {
          white-space: pre-wrap;
        }

        /* Markdown Styles */
        .markdown-p {
          margin: 0 0 0.75rem 0;
        }

        .markdown-p:last-child {
          margin-bottom: 0;
        }

        .markdown-strong {
          font-weight: 600;
          color: inherit;
        }

        .markdown-em {
          font-style: italic;
        }

        .markdown-ul,
        .markdown-ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .markdown-li {
          margin: 0.25rem 0;
        }

        .markdown-code-inline {
          background: rgba(0, 0, 0, 0.08);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .assistant-bubble .markdown-code-inline {
          background: rgba(0, 0, 0, 0.1);
        }

        .user-bubble .markdown-code-inline {
          background: rgba(255, 255, 255, 0.2);
        }

        .typing-indicator {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          animation: typingBounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .error-message {
          padding: 1rem 1.25rem;
          background: #fee;
          color: #c33;
          border-radius: 0.75rem;
          border: 1px solid #fcc;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .example-prompts {
          margin-top: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%);
          border-radius: 1rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .example-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .example-icon {
          font-size: 1.5rem;
        }

        .example-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .example-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .example-button {
          padding: 0.875rem 1.25rem;
          background: white;
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 0.75rem;
          cursor: pointer;
          text-align: left;
          font-size: 0.9375rem;
          color: #2d3748;
          transition: all 0.2s;
          font-family: inherit;
        }

        .example-button:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.4);
          transform: translateX(4px);
        }

        .input-container {
          padding: 1.25rem 1.5rem;
          background: white;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          background: #f7fafc;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 1.5rem;
          padding: 0.75rem 1rem;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: none;
          min-height: 24px;
          max-height: 120px;
          line-height: 1.5;
          color: #2d3748;
          outline: none;
        }

        .chat-input::placeholder {
          color: #a0aec0;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-hint {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: #a0aec0;
          text-align: center;
        }

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

        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .chat-container {
            max-width: 100%;
          }

          .message-content {
            max-width: 90%;
          }

          .header-content h1 {
            font-size: 1.125rem;
          }

          .header-content p {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}
