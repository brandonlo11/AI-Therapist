'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const createInitialConversation = (): Conversation => {
  const now = new Date().toISOString();
  return {
    id: `conv-${now}`,
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        role: 'assistant',
        content:
          "Hello Emma! I'm here to help you with relationship advice, communication, and emotional support. What's on your mind today?",
        timestamp: now,
      },
    ],
  };
};

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);
  const [relationshipContext, setRelationshipContext] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('relationshipContext');
      return saved || '';
    }
    return '';
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAvatar');
    }
    return null;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  const messages = activeConversation?.messages ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load saved context and avatar from localStorage
    if (typeof window !== 'undefined') {
      // conversations
      const storedConversations = localStorage.getItem('conversations');
      if (storedConversations) {
        try {
          const parsed: Conversation[] = JSON.parse(storedConversations);
          if (parsed.length > 0) {
            setConversations(parsed);
            setActiveConversationId(parsed[0].id);
          } else {
            const initial = createInitialConversation();
            setConversations([initial]);
            setActiveConversationId(initial.id);
          }
        } catch {
          const initial = createInitialConversation();
          setConversations([initial]);
          setActiveConversationId(initial.id);
        }
      } else {
        const initial = createInitialConversation();
        setConversations([initial]);
        setActiveConversationId(initial.id);
      }

      const saved = localStorage.getItem('relationshipContext');
      if (saved) {
        setRelationshipContext(saved);
      }
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setUserAvatar(savedAvatar);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (conversations.length === 0) return;
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setUserAvatar(imageDataUrl);
        localStorage.setItem('userAvatar', imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setUserAvatar(null);
    localStorage.removeItem('userAvatar');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date().toISOString();
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: now,
    };

    // Ensure there is an active conversation and compute the messages
    let baseMessages: Message[] = messages;
    let targetConversationId = activeConversationId;

    if (!activeConversation) {
      const initial = createInitialConversation();
      baseMessages = initial.messages;
      targetConversationId = initial.id;
      setConversations((prev) => [initial, ...prev]);
      setActiveConversationId(initial.id);
    }

    const conversationMessages: Message[] = [...baseMessages, userMessage];

    // Update conversations state with the new user message
    setConversations((prev) => {
      const idToUse = targetConversationId;
      const idx = prev.findIndex((c) => c.id === idToUse);
      if (idx === -1) {
        const initial = createInitialConversation();
        const updatedConv: Conversation = {
          ...initial,
          messages: conversationMessages,
          title:
            initial.title === 'New chat'
              ? userMessage.content.slice(0, 40) || 'New chat'
              : initial.title,
          updatedAt: now,
        };
        return [updatedConv, ...prev];
      }
      const conv = prev[idx];
      const updatedConv: Conversation = {
        ...conv,
        messages: conversationMessages,
        title:
          conv.title === 'New chat'
            ? userMessage.content.slice(0, 40) || 'New chat'
            : conv.title,
        updatedAt: now,
      };
      const updated = [...prev];
      updated[idx] = updatedConv;
      return updated;
    });

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
          messages: conversationMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          relationshipContext: relationshipContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const nowAssistant = new Date().toISOString();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: nowAssistant,
      };

      setConversations((prev) => {
        const idToUse = targetConversationId ?? activeConversationId;
        const idx = prev.findIndex((c) => c.id === idToUse);
        if (idx === -1) return prev;
        const conv = prev[idx];
        const newMessages = [...conv.messages, assistantMessage];
        const updatedConv: Conversation = {
          ...conv,
          messages: newMessages,
          updatedAt: nowAssistant,
        };
        const updated = [...prev];
        updated[idx] = updatedConv;
        return updated;
      });
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
    "How do I communicate my needs better in my relationship?",
    "What are healthy boundaries I should set?",
    "How can I resolve conflicts more effectively?",
    "How do I express my feelings without being too emotional?",
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleSaveContext = () => {
    if (contextTextareaRef.current) {
      const context = contextTextareaRef.current.value;
      setRelationshipContext(context);
      localStorage.setItem('relationshipContext', context);
      setShowContextModal(false);
    }
  };

  const handleNewConversation = () => {
    const initial = createInitialConversation();
    setConversations((prev) => [initial, ...prev]);
    setActiveConversationId(initial.id);
    setInput('');
    setError(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setError(null);
    setInput('');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const initial = createInitialConversation();
        setActiveConversationId(initial.id);
        return [initial];
      }
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <div className="chat-root">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <button className="new-chat-button" onClick={handleNewConversation}>
            +
          </button>
        </div>
        <div className="sidebar-list">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`sidebar-item ${
                conv.id === activeConversationId ? 'sidebar-item-active' : ''
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <span className="sidebar-item-title">
                {conv.title || 'New chat'}
              </span>
              <button
                className="sidebar-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                title="Delete chat"
              >
                🗑
              </button>
            </button>
          ))}
        </div>
      </aside>

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
            <h1>Emma's Relationship Coach</h1>
            <p>Your personal guide for relationships and emotional growth</p>
          </div>
        </div>
        <button 
          className="context-button"
          onClick={() => setShowContextModal(true)}
          title="Edit relationship context"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </header>

      {/* Context Modal */}
      {showContextModal && (
        <div className="modal-overlay" onClick={() => setShowContextModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Relationship Context</h2>
              <button className="modal-close" onClick={() => setShowContextModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="avatar-upload-section">
                <label className="avatar-upload-label">Your Avatar (Emma)</label>
                <div className="avatar-upload-container">
                  <div className="avatar-preview">
                    {userAvatar ? (
                      <img src={userAvatar} alt="User avatar preview" className="avatar-preview-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="avatar-upload-buttons">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="avatar-file-input"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className="avatar-upload-button">
                      {userAvatar ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    {userAvatar && (
                      <button className="avatar-remove-button" onClick={handleRemoveAvatar}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="context-section">
                <label className="context-label">Relationship Context</label>
                <p className="context-description">
                  Share details about your relationship with Emma to help me provide more personalized advice. 
                  For example: how long you've been together, your communication styles, common challenges, 
                  what works well, or anything else that would help me understand your relationship better.
                </p>
                <textarea
                  ref={contextTextareaRef}
                  className="context-textarea"
                  placeholder="E.g., We've been together for 2 years. Emma is more expressive with emotions while I tend to be more reserved. We sometimes struggle with communication during conflicts..."
                  defaultValue={relationshipContext}
                  rows={8}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button-secondary" onClick={() => setShowContextModal(false)}>
                Cancel
              </button>
              <button className="modal-button-primary" onClick={handleSaveContext}>
                Save Context
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {userAvatar ? (
                    <img src={userAvatar} alt="User avatar" className="avatar-image" />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
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
              <h3>Example questions you can ask, Emma</h3>
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
            placeholder="Hi Emma, what would you like to talk about today?"
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
      </div>

      <style jsx>{`
        .chat-root {
          display: flex;
          height: 100vh;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        .chat-sidebar {
          width: 260px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
          color: #2d3748;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          border-right: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .sidebar-header h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #2d3748;
        }

        .new-chat-button {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-weight: 300;
        }

        .new-chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .sidebar-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #2d3748;
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          text-align: left;
        }

        .sidebar-item:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .sidebar-item-active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-left: 3px solid #667eea;
          font-weight: 500;
        }

        .sidebar-item-title {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-align: left;
          flex: 1;
        }

        .sidebar-item-delete {
          border: none;
          background: transparent;
          color: #a0aec0;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.25rem;
          margin-left: 0.5rem;
          border-radius: 0.25rem;
          opacity: 0;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-item:hover .sidebar-item-delete {
          opacity: 1;
        }

        .sidebar-item-delete:hover {
          background: rgba(229, 62, 62, 0.1);
          color: #e53e3e;
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          flex: 1;
          background-color: #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
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
          overflow: hidden;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
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

        .context-button {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          color: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .context-button:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.05);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-in;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #718096;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #2d3748;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .avatar-upload-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .avatar-upload-label,
        .context-label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
          font-size: 0.9375rem;
        }

        .avatar-upload-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-upload-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .avatar-file-input {
          display: none;
        }

        .avatar-upload-button {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          text-align: center;
        }

        .avatar-upload-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .avatar-remove-button {
          padding: 0.5rem 1rem;
          background: #f7fafc;
          color: #e53e3e;
          border: 1px solid rgba(229, 62, 62, 0.2);
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .avatar-remove-button:hover {
          background: #fee;
          border-color: #e53e3e;
        }

        .context-section {
          margin-top: 1rem;
        }

        .context-description {
          color: #718096;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .context-textarea {
          width: 100%;
          padding: 0.875rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          min-height: 150px;
          line-height: 1.5;
          color: #2d3748;
        }

        .context-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .modal-button-secondary {
          padding: 0.625rem 1.25rem;
          background: #f7fafc;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          color: #2d3748;
          cursor: pointer;
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .modal-button-secondary:hover {
          background: #edf2f7;
        }

        .modal-button-primary {
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .modal-button-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .chat-root {
            flex-direction: column;
          }

          .chat-sidebar {
            width: 100%;
            height: 180px;
          }

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

          .chat-header {
            flex-wrap: wrap;
          }

          .context-button {
            margin-top: 0.5rem;
            width: auto;
          }

          .modal-content {
            width: 95%;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
}
