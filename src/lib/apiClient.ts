import ErrorLogger from "./errorLogger";
import { API_BASE_URL } from "./endpoints";

// Error handling utility
const handleApiError = (error: any, endpoint: string) => {
  let errorMessage = "An error occurred. Please try again.";
  let statusCode = 0;
  let responseData = {};
  
  // Extract as much information as possible from the error
  if (error.response) {
    statusCode = error.response.status;
    responseData = error.response.data || {};
    errorMessage = error.response.data?.message || `API Error (${statusCode})`;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  const context = {
    endpoint,
    status: statusCode,
    responseData,
    timestamp: new Date().toISOString()
  };
  
  console.log(`API clients Error on ${endpoint}`, "error", error instanceof Error ? error : new Error(errorMessage), context);
  
  return Promise.reject({
    message: errorMessage,
    status: statusCode,
    data: responseData,
    original: error
  });
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string, 
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET", 
  data?: any,
  headers: Record<string, string> = {}
): Promise<T> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    console.log(`API Request to ${endpoint}:`, { method, data });
    
    const response = await fetch(endpoint, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;
      throw { 
        response: { 
          data: errorData, 
          status: response.status,
          statusText: response.statusText
        },
        message: errorMessage
      };
    }
    
    const responseData = await response.json();
    console.log(`API Response from ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    return handleApiError(error, endpoint);
  }
};
