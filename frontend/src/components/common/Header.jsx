import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import logger from '../../lib/logger';
import {
  Users,
  MessageCircle,
  Calendar,
  Star,
  Settings,
  LogOut,
  BookOpen,
  Home,
  Mail,
  Award,
  Bot,
  Search,
  Bell,
  Shield,
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { getNotifications, getUnreadCount, markRead } = useNotifications();
  const { subscribe } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        setUnreadCount(await getUnreadCount());
      } catch (error) {
        logger.error('Failed to fetch unread notification count:', error);
      }
    };
    fetchUnread();
    // Polling is kept as a backstop even with the socket connected: it repairs
    // the count after a missed push, a sleeping laptop, or a blocked upgrade.
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Instant badge update when a notification is pushed.
  useEffect(() => {
    return subscribe('NOTIFICATION', (notification) => {
      setUnreadCount((count) => count + 1);
      // Only prepend if the panel is open; otherwise it reloads on next open.
      setNotifications((current) =>
        current.length === 0 || current.some((n) => n.id === notification.id)
          ? current
          : [notification, ...current],
      );
    });
  }, [subscribe]);

  const toggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      try {
        // The bell shows a recent slice only; the endpoint is paginated.
        const page = await getNotifications(0, 15);
        setNotifications(page.items);
      } catch (error) {
        logger.error('Failed to fetch notifications:', error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        logger.error('Failed to mark notification as read:', error);
      }
    }
  };

  const formatNotificationTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/skills', icon: BookOpen, label: 'My Skills' },
    { path: '/matching', icon: Users, label: 'Matching' },
    { path: '/requests', icon: Mail, label: 'Requests' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/sessions', icon: Calendar, label: 'Sessions' },
    { path: '/karma', icon: Award, label: 'Karma' },
    { path: '/ask-ai', icon: Bot, label: 'Ask AI' },
    ...(user?.role === 'ADMIN' ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">SkillSwap</span>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8 min-w-0">
            <div className="flex items-center space-x-1 xl:space-x-2 max-w-4xl">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline text-xs 2xl:text-sm">{label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side - Search and Profile */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-56 xl:w-64"
              />
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 flex-shrink-0">
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative flex-shrink-0" ref={notificationMenuRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40" />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 font-medium text-sm text-gray-900">
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {notification.body}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative flex-shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <img
                  src={
                    user?.profilePictureUrl ||
                    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400'
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
                <div className="hidden xl:block text-left min-w-0 max-w-32">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {user?.rating > 0 ? `★ ${user.rating.toFixed(1)}` : 'No ratings yet'}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40" />

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="xl:hidden px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.rating > 0 ? `★ ${user.rating.toFixed(1)} rating` : 'No ratings yet'}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>

                    <Link
                      to="/profile-setup"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  location.pathname === path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
