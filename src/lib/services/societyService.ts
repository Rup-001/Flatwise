
import { apiRequest } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import ErrorLogger from '../errorLogger';

export const createSociety = async (societyData: {
  buildingName: string;
  address: string;
  city: string;
  postcode: string;
  totalFlats: number;
}) => {
  // Validate required fields
  if (!societyData.buildingName || !societyData.address || !societyData.city || 
      !societyData.postcode || !societyData.totalFlats) {
    const missingFields = [];
    if (!societyData.buildingName) missingFields.push("buildingName");
    if (!societyData.address) missingFields.push("address");
    if (!societyData.city) missingFields.push("city");
    if (!societyData.postcode) missingFields.push("postcode");
    if (!societyData.totalFlats) missingFields.push("totalFlats");
    
    const errorMessage = `Missing required society fields: ${missingFields.join(", ")}`;
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
  
  const requestData = {
    name: societyData.buildingName,
    address: societyData.address,
    postal_code: societyData.postcode,
    city: societyData.city,
    state: `${societyData.city} Division`,
    country: "Bangladesh",
    total_flats: societyData.totalFlats
  };
  
  console.log("Creating society with data:", requestData);
  return apiRequest<any>(ENDPOINTS.SOCIETIES, "POST", requestData);
};

export const fetchSocietyUsers = async (societyId: number) => {
  try {
    return apiRequest<{
      owners: Array<{
        id: number;
        username: string;
        fullname: string;
        email: string;
        phone: string;
        status: string;
        role_id: number;
        society_id: number;
        owned_flats: Array<{
          id: number;
          number: string;
          flat_type: string;
        }>;
      }>;
      residents: Array<{
        id: number;
        username: string;
        fullname: string;
        email: string;
        phone: string;
        status: string;
        role_id: number;
        society_id: number;
        rented_flats: Array<any>;
      }>;
    }>(`${ENDPOINTS.USERS_BY_SOCIETY}/${societyId}`, "GET");
  } catch (error) {
    const errorMessage = "Failed to fetch society users";
    ErrorLogger.log(errorMessage, "error", error instanceof Error ? error : new Error(errorMessage));
    return Promise.reject({ message: errorMessage });
  }
};
