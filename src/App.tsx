
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { AppProvider } from './context/AppContext';
import { RegistrationProvider } from './context/RegistrationContext';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as SonnerToaster } from 'sonner';
import Index from './pages/Index';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';
import Support from './pages/Support';
import PaymentDue from './pages/PaymentDue';
import Subscription from './pages/Subscription';
import About from './pages/About';
import AcceptInvitation from './pages/AcceptInvitation';
import AcceptInvitationByToken from './pages/AcceptInvitationByToken';
import RegisterSuccess from './pages/RegisterSuccess';
import RegisterFailed from './pages/RegisterFailed';
import RegisterCancelled from './pages/RegisterCancelled';
import ManageCharges from './pages/ManageCharges';
import ManageFlats from './pages/ManageFlats';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PaymentHistory from './pages/PaymentHistory';
import InviteUsers from './pages/InviteUsers';
import ServiceChargePayments from './pages/ServiceChargePayments';
import UserBills from './pages/UserBills';
import Bills from './pages/Bills';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OwnerRoute } from './components/OwnerRoute';
import { PaymentDueRoute } from './components/PaymentDueRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RegistrationProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/users/:userId/accept" element={<AcceptInvitation />} />
              <Route path="/accept-invitation" element={<AcceptInvitationByToken />} />
              
              {/* Payment gateway return URLs */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/payment/cancelled" element={<PaymentCancelled />} />
              
              {/* Registration payment return URLs */}
              <Route path="/register/success" element={<RegisterSuccess />} />
              <Route path="/register/failed" element={<RegisterFailed />} />
              <Route path="/register/cancelled" element={<RegisterCancelled />} />
              
              {/* Payment Due Route - accessible when payment is due */}
              <Route path="/payment-due" element={<PaymentDueRoute><PaymentDue /></PaymentDueRoute>} />
              
              {/* Subscription page - accessible even when payment is due for admins/owners */}
              <Route path="/subscription" element={<OwnerRoute><Subscription /></OwnerRoute>} />
              
              {/* Support and About pages - accessible to all */}
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/manage-charges" element={<ProtectedRoute><ManageCharges /></ProtectedRoute>} />
              <Route path="/manage-flats" element={<ProtectedRoute><ManageFlats /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
              <Route path="/invite-users" element={<ProtectedRoute><InviteUsers /></ProtectedRoute>} />
              <Route path="/service-charge-payments" element={<ProtectedRoute><ServiceChargePayments /></ProtectedRoute>} />
              <Route path="/my-bills" element={<ProtectedRoute><UserBills /></ProtectedRoute>} />
              
              {/* Owner-only routes */}
              <Route path="/bills" element={<OwnerRoute><Bills /></OwnerRoute>} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SonnerToaster position="top-right" expand={false} richColors />
            <Toaster />
          </Router>
        </RegistrationProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
