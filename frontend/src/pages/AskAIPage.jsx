import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  Code, 
  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const AskAIPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample conversation starters
  const conversationStarters = [
    {
      icon: Code,
      title: 'Debugging Help',
      message: 'Can you help me debug this React useEffect hook?'
    },
    {
      icon: BookOpen,
      title: 'Learning Path',
      message: 'What should I learn after mastering JavaScript basics?'
    },
    {
      icon: Lightbulb,
      title: 'Best Practices',
      message: 'What are the best practices for responsive web design?'
    },
    {
      icon: Sparkles,
      title: 'Career Advice',
      message: 'How can I transition from frontend to full-stack development?'
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! I'm your AI learning assistant. I can help you with programming concepts, learning paths, debugging, best practices, and career advice. What would you like to learn about today?`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage) => {
    // Mock AI responses - replace with actual AI API integration
    const responses = [
      "Great question! Let me help you with that. Based on your learning history and current skill level, here's what I recommend...",
      "I understand you're working on this concept. Let me break it down step by step for you...",
      "That's a common challenge many developers face. Here's a practical approach you can take...",
      "Excellent! I can see you're making progress. Let me suggest some advanced techniques...",
      "I notice from your recent sessions that you've been working on React. This question relates perfectly to what you've been learning..."
    ];

    const contextualResponses = {
      'react': "Since you've been learning React in your recent sessions with Sarah Chen, I can provide some specific guidance on this topic. React is a powerful library, and here's what you should focus on next...",
      'javascript': "Based on your JavaScript learning path, I recommend diving deeper into these concepts. Your recent session covered ES6+ features, so let's build on that foundation...",
      'python': "I see you've been working on Python with Miguel Rodriguez. This is a great follow-up question to your machine learning sessions. Here's how to approach this...",
      'debug': "Debugging is a crucial skill! Let me walk you through a systematic approach that will help you identify and fix issues more efficiently...",
      'career': "Career development is important! Based on your current skills and learning trajectory in SkillSwap, here are some strategic recommendations..."
    };

    // Simple keyword matching for contextual responses
    const message = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(contextualResponses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = await generateAIResponse(messageText);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterClick = (starter) => {
    handleSendMessage(starter.message);
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! I'm your AI learning assistant. I can help you with programming concepts, learning paths, debugging, best practices, and career advice. What would you like to learn about today?`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Learning Assistant</h1>
                <p className="text-gray-600">Get instant help with your learning journey</p>
              </div>
            </div>
            <button
              onClick={clearConversation}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 80px)' }}>
            {messages.map(message => (
              <div key={message.id} className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.type === 'ai' && (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.type === 'user' ? 'order-first' : ''
                }`}>
                  <div className={`p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.type === 'ai' && !message.isError && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Helpful">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Not helpful">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            {/* Conversation Starters (show only when no messages except welcome) */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Try asking about:</p>
                <div className="grid grid-cols-2 gap-2">
                  {conversationStarters.map((starter, index) => (
                    <button
                      key={index}
                      onClick={() => handleStarterClick(starter)}
                      className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <starter.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{starter.title}</div>
                        <div className="text-xs text-gray-500 truncate">{starter.message}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about programming, learning paths, or career advice..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAIPage;