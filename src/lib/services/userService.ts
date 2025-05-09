
import { apiRequest } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import ErrorLogger from '../errorLogger';

export const inviteUsersBulk = async (users: Array<{
  name: string;
  email: string;
  userType: "owner" | "resident";
  flatId?: string;
}>, societyId: number) => {
  // Validate users array
  if (!users || users.length === 0) {
    const errorMessage = "No users provided for invitation";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  // Map user types to role_id
  const roleMap = {
    "owner": 2,
    "resident": 3
  };
  
  // Validate each user has required fields
  const validUsers = users.filter(user => user.name && user.email && user.userType);
  if (validUsers.length === 0) {
    const errorMessage = "No valid users with all required fields (name, email, userType)";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  const requestData = {
    society_id: societyId,
    users: validUsers.map(user => ({
      fullname: user.name,
      email: user.email,
      role_id: roleMap[user.userType]
    }))
  };
  
  console.log("Inviting users with data:", requestData);
  return apiRequest<{
    successful: Array<{
      id: number;
      email: string;
      invitationId: number;
    }>;
    failed: Array<any>;
  }>(ENDPOINTS.USERS_INVITE_BULK, "POST", requestData);
};

export const createFlatsBulk = async (
  flats: Array<{
    flatName: string;
    flatType: string;
    owner?: string;
    resident?: string;
  }>,
  societyId: number,
  userMap: Record<string, number>
) => {
  // Validate flats array
  if (!flats || flats.length === 0) {
    const errorMessage = "No flats provided for creation";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  const flatTypeMap: Record<string, string> = {
    "2bhk": "TWO_BHK",
    "3bhk": "THREE_BHK",
    "4bhk": "FOUR_BHK"
  };
  
  // Format flats for API
  const formattedFlats = flats.map(flat => {
    // Ensure flat has required fields, use defaults if needed
    const flatData: any = {
      number: flat.flatName || `Flat ${Math.random().toString(36).substring(2, 7)}`,
      flat_type: flatTypeMap[flat.flatType] || "TWO_BHK"
    };
    
    // Add owner_id if provided and exists in userMap
    if (flat.owner && userMap[flat.owner]) {
      flatData.owner_id = userMap[flat.owner];
    }
    
    // Add resident_id if provided and exists in userMap
    if (flat.resident && userMap[flat.resident]) {
      flatData.resident_id = userMap[flat.resident];
    }
    
    return flatData;
  });
  
  const requestData = {
    society_id: societyId,
    flats: formattedFlats
  };
  
  console.log("Creating flats with data:", requestData);
  return apiRequest<{
    successful: Array<{
      id: number;
      number: string;
      society_id: number;
      owner_id: number | null;
      resident_id: number | null;
      flat_type: string;
      created_at: string;
    }>;
    failed: Array<any>;
  }>(ENDPOINTS.FLATS_BULK, "POST", requestData);
};
