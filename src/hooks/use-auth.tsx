
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import { apiRequest, ENDPOINTS, AuthResponse, mapRoleIdToString, USER_ROLES } from '@/lib/api';
import ErrorLogger from '@/lib/errorLogger';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    login: contextLogin, 
    logout: contextLogout, 
    register: contextRegister, 
    auth,
    fetchServiceCharges, 
    serviceCharges,
    updateSocietyStatus 
  } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Custom API integration
      const response = await apiRequest<AuthResponse>(`${ENDPOINTS.AUTH}/login`, "POST", {
        email,
        password
      });
      
      if (response.access_token) {
        // Store the token without "Bearer" prefix
        localStorage.setItem("authToken", response.access_token);
        
        // Check society status if available
        if (response.society) {
          const societyStatus = response.society.status;
          
          // If society is INACTIVE, don't allow login
          if (societyStatus === 'INACTIVE') {
            localStorage.removeItem("authToken");
            throw new Error("Your society is currently inactive. Please contact support.");
          }
          
          // Update society status in context
          updateSocietyStatus(societyStatus);
          
          // Get the standardized role string
          const userRole = mapRoleIdToString(response.user.role_id);
          
          // Update context with user info
          await contextLogin({
            id: String(response.user.id),
            name: response.user.fullname,
            email: response.user.email,
            role: userRole,
            profileCompleted: true,
            society_id: response.user.society_id,
            role_id: response.user.role_id,
            pay_service_charge: response.user.pay_service_charge
          });
          
          // If PAYMENT_DUE, redirect to payment-due page
          if (societyStatus === 'PAYMENT_DUE') {
            navigate('/payment-due');
            toast.warning('Your society has a pending payment. Please settle it to continue using all features.');
            setIsLoading(false);
            return;
          }
          
          // If society status is active, proceed normally
          try {
            await fetchServiceCharges();
            
            // Check if service charges exist, if not redirect to manage-charges
            if (!serviceCharges.items || serviceCharges.items.length === 0) {
              navigate('/manage-charges');
            } else {
              navigate('/dashboard');
            }
          } catch (error) {
            // If there's an error fetching service charges, default to dashboard
            navigate('/dashboard');
          }
        } else {
          // Handle case where society info is not available
          const userRole = mapRoleIdToString(response.user.role_id);
                          
          await contextLogin({
            id: String(response.user.id),
            name: response.user.fullname,
            email: response.user.email,
            role: userRole,
            profileCompleted: true,
            society_id: response.user.society_id,
            role_id: response.user.role_id,
            pay_service_charge: response.user.pay_service_charge
          });
          
          navigate('/dashboard');
        }
        
        // Show success toast
        toast.success('Login successful!');
      } else {
        throw new Error("Invalid response from server: no token received");
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      ErrorLogger.log(
        'Login error', 
        'error', 
        error instanceof Error ? error : new Error(errorMessage), 
        { 
          email, 
          endpoint: `${ENDPOINTS.AUTH}/login`,
          responseData: error.data
        }
      );
      
      // Show toast for user feedback
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      contextLogout();
      navigate('/login');
    } catch (error) {
      ErrorLogger.log(
        'Logout error', 
        'error', 
        error instanceof Error ? error : new Error('Logout failed')
      );
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      // Validate the required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password'];
      const missingFields = requiredFields.filter(field => {
        const value = userData[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(", ")}`;
        throw new Error(errorMessage);
      }
      
      // Validate phone number (11 digits)
      if (userData.phone && !/^\d{11}$/.test(userData.phone)) {
        throw new Error("Phone number must be exactly 11 digits");
      }
      
      // Validate postal code (4 digits)
      if (userData.postal_code && !/^\d{4}$/.test(userData.postal_code)) {
        throw new Error("Postal code must be exactly 4 digits");
      }
      
      // Store the registration data in localStorage for the simplified flow
      if (userData.simplified) {
        localStorage.setItem("registrationUserData", JSON.stringify(userData));
        navigate('/register-simplified/building');
        return;
      }
      
      // The actual registration process is now handled in the Register component
      // This is just for compatibility with other components using this hook
      await contextRegister(userData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      ErrorLogger.log(
        'Registration error', 
        'error', 
        error instanceof Error ? error : new Error(errorMessage), 
        { 
          userData,
          responseData: error.data 
        }
      );
      
      // Show toast for user feedback
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  //send reset code

  const sendResetCode = async (email: string) => {
    setIsLoading(true);
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const response = await apiRequest<{ message: string }>(
        `${ENDPOINTS.FORGOT_PASSWORD}/forgot-password`,
        "POST",
        { email }
      );

      if (response.message) {
        toast.success('Reset code sent to your email!');
        return true;
      } else {
        throw new Error("Failed to send reset code");
      }
      // if (response.message) {
      //   toast.success('Reset code sent to your email!');
      //   return true;
      // } else {
      //   throw new Error("Failed to send reset code");
      // }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset code';
      ErrorLogger.log(
        'Send reset code error',
        'error',
        error instanceof Error ? error : new Error(errorMessage),
        { email, endpoint: `${ENDPOINTS.AUTH}/forgot-password` }
      );
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  return {
    isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    sendResetCode
  };
};

export default useAuth;
