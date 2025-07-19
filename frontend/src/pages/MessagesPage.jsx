import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Calendar,
  Star,
  Clock
} from 'lucide-react';

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Mock chat data - replace with actual API calls
  const [chats, setChats] = useState([
    {
      id: '1',
      participant: {
        id: 'user1',
        name: 'Sarah Chen',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'online',
        lastSeen: 'online'
      },
      lastMessage: {
        text: 'Great! Looking forward to our React session tomorrow.',
        timestamp: '2:30 PM',
        senderId: 'user1'
      },
      unreadCount: 2,
      messages: [
        {
          id: '1',
          senderId: 'user1',
          text: 'Hi! Thanks for accepting my match request. When would be a good time for our first React session?',
          timestamp: '2024-01-15T14:00:00Z',
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          text: 'Hi Sarah! I\'m excited to get started. How about tomorrow at 3 PM?',
          timestamp: '2024-01-15T14:15:00Z',
          type: 'text'
        },
        {
          id: '3',
          senderId: 'user1',
          text: 'Perfect! I\'ll send you the Zoom link.',
          timestamp: '2024-01-15T14:20:00Z',
          type: 'text'
        },
        {
          id: '4',
          senderId: 'user1',
          text: 'Great! Looking forward to our React session tomorrow.',
          timestamp: '2024-01-15T14:30:00Z',
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      participant: {
        id: 'user2',
        name: 'Miguel Rodriguez',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'away',
        lastSeen: '1 hour ago'
      },
      lastMessage: {
        text: 'Thanks for the Python tips!',
        timestamp: '11:45 AM',
        senderId: 'user2'
      },
      unreadCount: 0,
      messages: [
        {
          id: '1',
          senderId: 'current-user',
          text: 'Hey Miguel! Ready for our machine learning session?',
          timestamp: '2024-01-15T10:00:00Z',
          type: 'text'
        },
        {
          id: '2',
          senderId: 'user2',
          text: 'Absolutely! I\'ve prepared some examples we can work through.',
          timestamp: '2024-01-15T10:30:00Z',
          type: 'text'
        },
        {
          id: '3',
          senderId: 'user2',
          text: 'Thanks for the Python tips!',
          timestamp: '2024-01-15T11:45:00Z',
          type: 'text'
        }
      ]
    },
    {
      id: '3',
      participant: {
        id: 'user3',
        name: 'Emma Thompson',
        profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'offline',
        lastSeen: '2 days ago'
      },
      lastMessage: {
        text: 'Let\'s schedule our design session for next week.',
        timestamp: 'Yesterday',
        senderId: 'user3'
      },
      unreadCount: 1,
      messages: [
        {
          id: '1',
          senderId: 'user3',
          text: 'Hi! I\'m excited to learn about your design process.',
          timestamp: '2024-01-14T16:00:00Z',
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          text: 'Great! I have some case studies we can review together.',
          timestamp: '2024-01-14T16:30:00Z',
          type: 'text'
        },
        {
          id: '3',
          senderId: 'user3',
          text: 'Let\'s schedule our design session for next week.',
          timestamp: '2024-01-14T17:00:00Z',
          type: 'text'
        }
      ]
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: {
                text: message.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderId: 'current-user'
              }
            }
          : chat
      )
    );

    setNewMessage('');
    scrollToBottom();
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Sidebar - Chat List */}
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

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={chat.participant.profilePictureUrl}
                          alt={chat.participant.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(chat.participant.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {chat.participant.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage.text}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={selectedChat.participant.profilePictureUrl}
                            alt={selectedChat.participant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedChat.participant.status)}`} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {selectedChat.participant.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedChat.participant.status === 'online' 
                              ? 'Online' 
                              : `Last seen ${selectedChat.participant.lastSeen}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedChat.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === 'current-user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 'current-user'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
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