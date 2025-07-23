import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  Search
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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

            {/* Profile Menu */}
            <div className="relative flex-shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <img
                  src={user?.profilePictureUrl || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
                <div className="hidden xl:block text-left min-w-0 max-w-32">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {user?.karmaPoints || 0} karma
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40" />
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="xl:hidden px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.karmaPoints || 0} karma points
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
