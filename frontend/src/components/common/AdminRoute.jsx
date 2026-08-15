import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
