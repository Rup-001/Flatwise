
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface PaymentDueRouteProps {
  children: React.ReactNode;
}

export const PaymentDueRoute: React.FC<PaymentDueRouteProps> = ({ children }) => {
  const { auth, society } = useAppContext();
  
  // Only allow access if authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If society status isn't PAYMENT_DUE, redirect to dashboard
  if (society.status !== 'PAYMENT_DUE') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
