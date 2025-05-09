
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { USER_ROLES } from '@/lib/services/authService';

interface OwnerRouteProps {
  children: React.ReactNode;
}

export const OwnerRoute: React.FC<OwnerRouteProps> = ({ children }) => {
  const { auth } = useAppContext();
  
  // Check if user is authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has admin or owner role using role_id
  const roleId = auth.user?.role_id;
  if (roleId !== USER_ROLES.ADMIN && roleId !== USER_ROLES.OWNER) {
    console.log('Access denied: User role_id:', roleId, 'Required: ADMIN(1) or OWNER(2)');
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
