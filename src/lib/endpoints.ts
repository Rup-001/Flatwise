
// Export the API_BASE_URL
export const API_BASE_URL = "http://localhost:3000";
// export const API_BASE_URL = "https://api.flatwise.tanapps.com";
// export const API_BASE_URL = "https://raccoon-eternal-surely.ngrok-free.app";

// API endpoints
export const ENDPOINTS = {
  USERS: `${API_BASE_URL}/users`,
  FLATS: `${API_BASE_URL}/flats`,
  CHARGES: `${API_BASE_URL}/charges`,
  INVITATIONS: `${API_BASE_URL}/invitations`,
  BILLS: `${API_BASE_URL}/bills`,  
  PAYMENTS: `${API_BASE_URL}/payments`,
  AUTH: `${API_BASE_URL}/auth`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
  SOCIETIES: `${API_BASE_URL}/societies`,
  USERS_INVITE_BULK: `${API_BASE_URL}/users/invite/bulk`,
  FLATS_BULK: `${API_BASE_URL}/flats/bulk`,
  PREDEFINED_SERVICE_CHARGES: `${API_BASE_URL}/predefined-service-charges`,
  SERVICE_CHARGES: `${API_BASE_URL}/service-charges`,
  SERVICE_CHARGES_BULK: `${API_BASE_URL}/service-charges/bulk`,
  USER_SERVICE_CHARGES: `${API_BASE_URL}/user-service-charges`,
  USERS_BY_SOCIETY: `${API_BASE_URL}/users/society`,
  PRICING: `${API_BASE_URL}/pricing`
};
