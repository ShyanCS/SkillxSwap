import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Inbox, 
  Clock, 
  Check, 
  X, 
  User, 
  MessageCircle,
  Calendar,
  Star,
  AlertCircle
} from 'lucide-react';

const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState('received');

  // Mock data - replace with actual API calls
  const [receivedRequests, setReceivedRequests] = useState([
    {
      id: '1',
      sender: {
        id: 'user1',
        name: 'Alex Johnson',
        profilePictureUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        karmaPoints: 320
      },
      skillWanted: {
        name: 'React Development',
        proficiencyLevel: 'Advanced'
      },
      skillOffered: {
        name: 'Python Programming',
        proficiencyLevel: 'Intermediate'
      },
      message: 'Hi! I\'m really interested in learning React from you. I have some Python experience and would love to teach you in exchange. Looking forward to connecting!',
      sentAt: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      sender: {
        id: 'user2',
        name: 'Maria Garcia',
        profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9,
        karmaPoints: 580
      },
      skillWanted: {
        name: 'UI/UX Design',
        proficiencyLevel: 'Intermediate'
      },
      skillOffered: {
        name: 'Digital Marketing',
        proficiencyLevel: 'Advanced'
      },
      message: 'Hello! I saw your UI/UX design skills and I\'m very interested in learning from you. I can teach you digital marketing strategies in return.',
      sentAt: '1 day ago',
      status: 'pending'
    },
    {
      id: '3',
      sender: {
        id: 'user3',
        name: 'David Kim',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.6,
        karmaPoints: 290
      },
      skillWanted: {
        name: 'JavaScript ES6+',
        proficiencyLevel: 'Advanced'
      },
      skillOffered: {
        name: 'Data Analytics',
        proficiencyLevel: 'Intermediate'
      },
      message: 'Hi there! I need help with advanced JavaScript concepts. I can help you with data analytics and visualization techniques.',
      sentAt: '3 days ago',
      status: 'accepted'
    }
  ]);

  const [sentRequests, setSentRequests] = useState([
    {
      id: '1',
      recipient: {
        id: 'user4',
        name: 'Sarah Chen',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9,
        karmaPoints: 520
      },
      skillWanted: {
        name: 'Machine Learning',
        proficiencyLevel: 'Advanced'
      },
      skillOffered: {
        name: 'React Development',
        proficiencyLevel: 'Advanced'
      },
      message: 'Hi Sarah! I\'m very interested in learning machine learning from you. I can teach you React development in exchange.',
      sentAt: '1 hour ago',
      status: 'pending'
    },
    {
      id: '2',
      recipient: {
        id: 'user5',
        name: 'Emma Thompson',
        profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 5.0,
        karmaPoints: 670
      },
      skillWanted: {
        name: 'Product Management',
        proficiencyLevel: 'Advanced'
      },
      skillOffered: {
        name: 'Frontend Development',
        proficiencyLevel: 'Intermediate'
      },
      message: 'Hello Emma! I would love to learn product management from you. I can help you with frontend development techniques.',
      sentAt: '5 hours ago',
      status: 'accepted'
    },
    {
      id: '3',
      recipient: {
        id: 'user6',
        name: 'Miguel Rodriguez',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        karmaPoints: 380
      },
      skillWanted: {
        name: 'DevOps',
        proficiencyLevel: 'Intermediate'
      },
      skillOffered: {
        name: 'JavaScript',
        proficiencyLevel: 'Advanced'
      },
      message: 'Hi Miguel! I\'m interested in learning DevOps practices from you.',
      sentAt: '2 days ago',
      status: 'rejected'
    }
  ]);

  const handleAcceptRequest = (requestId) => {
    setReceivedRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'accepted' }
          : request
      )
    );
  };

  const handleRejectRequest = (requestId) => {
    setReceivedRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'rejected' }
          : request
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const RequestCard = ({ request, type, onAccept, onReject }) => {
    const user = type === 'received' ? request.sender : request.recipient;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.profilePictureUrl}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{user.rating}</span>
                <span>•</span>
                <span>{user.karmaPoints} karma</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">{request.sentAt}</span>
          </div>
        </div>

        {/* Skills Exchange */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  {type === 'received' ? 'They Want to Learn' : 'You Want to Learn'}
                </span>
              </div>
              <h4 className="font-medium text-gray-900">{request.skillWanted.name}</h4>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {request.skillWanted.proficiencyLevel}
              </span>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  {type === 'received' ? 'They Offer' : 'You Offer'}
                </span>
              </div>
              <h4 className="font-medium text-gray-900">{request.skillOffered.name}</h4>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {request.skillOffered.proficiencyLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mb-4">
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg italic">
              "{request.message}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link
            to={`/profile/${user.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <User className="w-4 h-4" />
            View Profile
          </Link>

          <div className="flex gap-2">
            {type === 'received' && request.status === 'pending' && (
              <>
                <button
                  onClick={() => onReject(request.id)}
                  className="px-3 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => onAccept(request.id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  Accept
                </button>
              </>
            )}
            
            {request.status === 'accepted' && (
              <div className="flex gap-2">
                <Link
                  to="/messages"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  Chat
                </Link>
                <Link
                  to="/schedule"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  Schedule
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Requests</h1>
          <p className="text-gray-600">
            Manage incoming and outgoing skill exchange requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receivedRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Inbox className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-600 mt-2">Require your response</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...receivedRequests, ...sentRequests].filter(r => r.status === 'accepted').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">Ready to connect</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent Requests</p>
                <p className="text-2xl font-bold text-gray-900">{sentRequests.length}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-600 mt-2">Awaiting response</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Received Requests ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sent'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sent Requests ({sentRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Received Requests */}
            {activeTab === 'received' && (
              <div className="space-y-6">
                {receivedRequests.length > 0 ? (
                  receivedRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests received</h3>
                    <p className="text-gray-500 mb-4">
                      When others send you match requests, they'll appear here
                    </p>
                    <Link
                      to="/matching"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Find Matches
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <div className="space-y-6">
                {sentRequests.length > 0 ? (
                  sentRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h3>
                    <p className="text-gray-500 mb-4">
                      Start connecting by sending match requests to other users
                    </p>
                    <Link
                      to="/matching"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Browse Matches
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;