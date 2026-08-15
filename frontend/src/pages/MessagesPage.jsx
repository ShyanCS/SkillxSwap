import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Calendar
} from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';

const MessagesPage = () => {
  const { getConversations, getMessages, sendMessage } = useMessaging();
  const [selectedConversation, setSelectedConversation] = useState(null); // a conversation summary entry
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const openConversation = async (conv) => {
    setSelectedConversation(conv);
    if (!conv.conversationId) {
      setMessages([]);
      return;
    }
    try {
      const data = await getMessages(conv.conversationId);
      setMessages(data);
      // Refresh the list in the background so unread counts/read receipts update.
      fetchConversations();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const body = newMessage.trim();
    setNewMessage('');
    try {
      const sent = await sendMessage(selectedConversation.partner.id, body);
      setMessages(prev => [...prev, sent]);
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatListTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <p className="p-4 text-gray-500">Loading...</p>
                ) : filteredConversations.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">
                    No conversations yet. Accept a match request to start messaging.
                  </p>
                ) : (
                  filteredConversations.map(conv => (
                    <div
                      key={conv.partner.id}
                      onClick={() => openConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.partner.id === conv.partner.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={conv.partner.profilePictureUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.partner.name)}
                          alt={conv.partner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conv.partner.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatListTime(conv.lastMessage?.sentAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage ? conv.lastMessage.body : 'Say hello!'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedConversation.partner.profilePictureUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedConversation.partner.name)}
                          alt={selectedConversation.partner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {selectedConversation.partner.name}
                          </h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/schedule"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Schedule a session"
                        >
                          <Calendar className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === selectedConversation.partner.id ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === selectedConversation.partner.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}>
                          <p className="text-sm">{message.body}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === selectedConversation.partner.id
                              ? 'text-gray-500'
                              : 'text-blue-100'
                          }`}>
                            {formatMessageTime(message.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* No Chat Selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
