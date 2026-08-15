import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const AdminContext = createContext(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const apiGet = async (path) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const apiMutate = async (path, method) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const getStats = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/admin/stats');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async () => await apiGet('/api/admin/users');
  const suspendUser = async (id) => await apiMutate(`/api/admin/users/${id}/suspend`, 'PUT');
  const activateUser = async (id) => await apiMutate(`/api/admin/users/${id}/activate`, 'PUT');

  const getSkills = async () => await apiGet('/api/admin/skills');
  const deleteSkill = async (id) => await apiMutate(`/api/admin/skills/${id}`, 'DELETE');

  const getReports = async () => await apiGet('/api/admin/reports');
  const resolveReport = async (id) => await apiMutate(`/api/admin/reports/${id}/resolve`, 'PUT');

  return (
    <AdminContext.Provider value={{
      getStats, getUsers, suspendUser, activateUser,
      getSkills, deleteSkill, getReports, resolveReport,
      isLoading,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
