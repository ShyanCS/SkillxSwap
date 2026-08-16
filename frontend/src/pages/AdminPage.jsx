import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Coins,
  Flag,
  CheckCircle,
  Ban,
  UserCheck,
  Trash2,
  Search
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

const USERS_PER_PAGE = 20;

const AdminPage = () => {
  const { getStats, getUsers, suspendUser, activateUser, getSkills, deleteSkill, getReports, resolveReport } = useAdmin();
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userPageInfo, setUserPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });

  const loadUsers = async (page = userPage, q = userQuery) => {
    const data = await getUsers({ q, page, size: USERS_PER_PAGE });
    setUsers(data.items);
    setUserPageInfo({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements });
    setUserPage(data.page);
  };

  const loadAll = async () => {
    try {
      const [statsData, skillsData, reportsData] = await Promise.all([
        getStats(), getSkills(), getReports(),
      ]);
      setStats(statsData);
      setSkills(skillsData);
      setReports(reportsData);
      await loadUsers(0, '');
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Debounced so typing a search doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(0, userQuery).catch(err => setError(err.message || 'Search failed'));
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery]);

  const handleToggleUser = async (user) => {
    try {
      if (user.enabled) {
        await suspendUser(user.id);
      } else {
        await activateUser(user.id);
      }
      // Stay on the current page rather than resetting to the first.
      await loadUsers(userPage, userQuery);
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkill(skillId);
      setSkills(await getSkills());
    } catch (err) {
      alert(err.message || 'Failed to delete skill');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await resolveReport(reportId);
      const [reportsData, statsData] = await Promise.all([getReports(), getStats()]);
      setReports(reportsData);
      setStats(statsData);
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-8 text-center text-gray-500">Loading admin panel...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 pt-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Platform governance, users, skills, and complaint management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.totalSkillsInCatalog}</p>
            <p className="text-xs text-gray-500">Skills in Catalog</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.scheduledSessions}</p>
            <p className="text-xs text-gray-500">Scheduled Sessions</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.completedSessions}</p>
            <p className="text-xs text-gray-500">Completed Sessions</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.creditsInCirculation}</p>
            <p className="text-xs text-gray-500">Credits in Circulation</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.openReports}</p>
            <p className="text-xs text-gray-500">Open Reports</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['users', 'skills', 'reports'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab} {tab === 'reports' && stats.openReports > 0 && `(${stats.openReports})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <div className="relative mb-4 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3 pr-4">Rating</th>
                      <th className="pb-3 pr-4">Joined</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-900">{u.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{u.rating.toFixed(1)}</td>
                        <td className="py-3 pr-4 text-gray-600">{formatDate(u.createdAt)}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${u.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {u.enabled ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleUser(u)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              u.enabled
                                ? 'border border-red-300 text-red-700 hover:bg-red-50'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {u.enabled ? <><Ban className="w-3 h-3" /> Suspend</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">
                          {userQuery ? `No users matching "${userQuery}"` : 'No users yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>

                {userPageInfo.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-gray-500">
                      Page {userPageInfo.page + 1} of {userPageInfo.totalPages} &middot; {userPageInfo.totalElements} users
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadUsers(userPage - 1, userQuery)}
                        disabled={userPage <= 0}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => loadUsers(userPage + 1, userQuery)}
                        disabled={userPage >= userPageInfo.totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skills.map(skill => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove from catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No reports have been filed.</p>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{report.reporterName}</span> reported{' '}
                            <span className="font-medium">{report.reportedUserName}</span>
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">{report.reason}</p>
                      {report.status === 'Open' && (
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
