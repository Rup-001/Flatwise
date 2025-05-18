
import { apiRequest } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import ErrorLogger from '../errorLogger';
console.log("auth service 1111")


export const checkUserAvailability = async (email: string, phone: string) => {
  return apiRequest<{ email: boolean; phone: boolean }>(
    `${ENDPOINTS.USERS}/check-availability`,
    "POST",
    { email, phone }
  );
};
// Types
export interface AuthResponse {
  
  access_token: string;
  user: {
    id: number;
    username: string;
    fullname: string;
    alias: string;
    email: string;
    phone: string;
    role_id: number;
    society_id: number;
    flat_id: number | null;
    service_type: string | null;
    pay_service_charge: boolean;
    created_at: string;
    status: string;
  };
  society?: {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE';
  };
}

// User role mapping - centralizing the role definitions
export const USER_ROLES = {
  ADMIN: 1,
  OWNER: 2,
  RESIDENT: 3
};

// Convert numeric role_id to string role (used throughout the app)
export const mapRoleIdToString = (roleId: number): "admin" | "owner" | "resident" => {
  switch(roleId) {
    case USER_ROLES.ADMIN: return "admin";
    case USER_ROLES.OWNER: return "owner";
    case USER_ROLES.RESIDENT: return "resident";
    default: return "resident"; // Default fallback
    console.log("auth service 444")
  }
};

// Registration flow API call
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  society_id?: number;
}) => {
  console.log("auth service 2222")
  const callId = Math.random().toString(36).substring(2, 8); // Unique call ID
  console.log(`auth service 2222 [callId: ${callId}]`);
  console.log(`Registering user with data [callId: ${callId}]:`, userData);
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'society_id'] as const;
  
  // Improved type-safe filtering of missing fields
  const missingFields = requiredFields.filter(field => {
    const value = userData[field];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  
  if (missingFields.length > 0) {
    const errorMessage = `Missing required fields: ${missingFields.join(", ")}`;
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  // Generate a username (prevent empty username)
  const username = userData.firstName.toLowerCase().replace(/\s+/g, '') || 
                  `user${Math.floor(Math.random() * 10000)}`;
  
  // Ensure fullname is not empty and properly trimmed
  const firstName = userData.firstName.trim();
  const lastName = userData.lastName.trim();
  const fullname = `${firstName} ${lastName}`.trim();
  
  if (!fullname.trim()) {
    const errorMessage = "Full name cannot be empty";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  const requestData = {
    username,
    fullname,
    alias: username,
    email: userData.email.trim(),
    phone: userData.phone.trim(),
    password: userData.password,
    role_id: USER_ROLES.ADMIN, // Default value for administrator
    society_id: userData.society_id || 1, // Will be updated after society creation
    status: "ACTIVE"
  };
  console.log("auth service 333")
  console.log("Registering user with data:", requestData);
  console.log(`auth service 333 [callId: ${callId}]`);
  return apiRequest<any>(ENDPOINTS.USERS, "POST", requestData);
};
