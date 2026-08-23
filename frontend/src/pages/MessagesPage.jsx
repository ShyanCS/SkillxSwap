import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Calendar } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useRealtime } from '../contexts/RealtimeContext';
import logger from '../lib/logger';

const MessagesPage = () => {
  const { getConversations, getMessages, sendMessage } = useMessaging();
  const { subscribe } = useRealtime();
  const [selectedConversation, setSelectedConversation] = useState(null); // a conversation summary entry
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ page: 0, hasNext: false });
  const [loadingOlder, setLoadingOlder] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // Autoscrolling to the newest message is right when opening a chat or
  // sending, but wrong when prepending history -- that would yank the reader
  // away from the older messages they just asked for.
  const stickToBottomRef = useRef(true);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      logger.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const openConversation = async (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    setPageInfo({ page: 0, hasNext: false });
    if (!conv.conversationId) {
      return;
    }
    try {
      const data = await getMessages(conv.conversationId, 0);
      stickToBottomRef.current = true;
      // The API returns newest-first so page 0 is the bottom of the chat;
      // reverse it back into reading order.
      setMessages([...data.items].reverse());
      setPageInfo({ page: data.page, hasNext: data.hasNext });
      // Refresh the list in the background so unread counts/read receipts update.
      fetchConversations();
    } catch (error) {
      logger.error('Failed to load messages:', error);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation?.conversationId || loadingOlder || !pageInfo.hasNext) return;
    setLoadingOlder(true);
    const container = messagesContainerRef.current;
    const heightBefore = container?.scrollHeight ?? 0;
    try {
      const data = await getMessages(selectedConversation.conversationId, pageInfo.page + 1);
      stickToBottomRef.current = false;
      setMessages((prev) => [...[...data.items].reverse(), ...prev]);
      setPageInfo({ page: data.page, hasNext: data.hasNext });
      // Prepending grows the scroll area upward, which would otherwise shove
      // the current view down by exactly the height of the new content.
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - heightBefore;
      });
    } catch (error) {
      logger.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  };

  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  }, [messages]);

  // Live delivery of messages sent to us while this page is open.
  useEffect(() => {
    return subscribe('MESSAGE_RECEIVED', ({ senderId, message }) => {
      // Always refresh the sidebar so a message from a chat we don't currently
      // have open still bumps its unread badge and preview.
      fetchConversations();

      setSelectedConversation((current) => {
        if (current?.partner.id !== senderId) return current;
        stickToBottomRef.current = true;
        setMessages((prev) =>
          // The sender's own echo and a reconnect replay can both re-deliver a
          // message we already have.
          prev.some((m) => m.id === message.id) ? prev : [...prev, message],
        );
        return current;
      });
    });
  }, [subscribe]);

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
      stickToBottomRef.current = true;
      setMessages((prev) => [...prev, sent]);
      fetchConversations();
    } catch (error) {
      logger.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatListTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ height: 'calc(100vh - 120px)' }}
        >
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
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.partner.id}
                      type="button"
                      onClick={() => openConversation(conv)}
                      className={`block w-full text-left p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.partner.id === conv.partner.id
                          ? 'bg-blue-50 border-blue-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            conv.partner.profilePictureUrl ||
                            'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(conv.partner.name)
                          }
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
                    </button>
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
                          src={
                            selectedConversation.partner.profilePictureUrl ||
                            'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(selectedConversation.partner.name)
                          }
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
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {pageInfo.hasNext && (
                      <div className="flex justify-center">
                        <button
                          onClick={loadOlderMessages}
                          disabled={loadingOlder}
                          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                          {loadingOlder ? 'Loading...' : 'Load earlier messages'}
                        </button>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === selectedConversation.partner.id
                            ? 'justify-start'
                            : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === selectedConversation.partner.id
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === selectedConversation.partner.id
                                ? 'text-gray-500'
                                : 'text-blue-100'
                            }`}
                          >
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
