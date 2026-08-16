import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, AlertCircle, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const SUGGESTIONS = [
  'How should I structure my first teaching session?',
  'Give me a 4-week plan to learn the basics of guitar.',
  'What questions should I ask my teacher to get the most out of a session?',
  'How do I explain a difficult concept to a complete beginner?',
];

const AskAIPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [available, setAvailable] = useState(null); // null = still checking
  const endRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/status`, { credentials: 'include' });
        const data = await res.json();
        setAvailable(Boolean(data.available));
      } catch {
        setAvailable(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const ask = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.error, isError: true }]);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'The assistant could not answer that.');
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: data.answer,
        isError: data.available === false,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: err.message || 'Something went wrong reaching the assistant.',
        isError: true,
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Study Assistant</h1>
          </div>
          <p className="text-gray-600">
            Ask for study plans, explanations, or help preparing for your exchange sessions.
          </p>
        </div>

        {available === false && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">The assistant isn't enabled on this deployment.</p>
              <p className="text-sm">
                An administrator needs to set <code className="bg-amber-100 px-1 rounded">AI_ENABLED</code> and{' '}
                <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> to turn it on.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '420px' }}>
          {/* Conversation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6">Ask anything about learning or teaching a skill.</p>
                <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      disabled={available === false || sending}
                      className="text-left text-sm px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <div key={i} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className={`p-2 rounded-full h-fit ${message.isError ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      <Bot className={`w-4 h-4 ${message.isError ? 'text-amber-600' : 'text-blue-600'}`} />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-gray-200 p-2 rounded-full h-fit">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex gap-3">
                <div className="bg-blue-100 p-2 rounded-full h-fit">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200 p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); ask(input); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
                placeholder={available === false ? 'Assistant unavailable' : 'Ask a question…'}
                disabled={available === false || sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending || available === false}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              The assistant can't see your messages, credits, or account, and can't act on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAIPage;
