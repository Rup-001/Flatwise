// Export the API client
export { apiRequest } from './apiClient';

// Export the API endpoints
export { ENDPOINTS, API_BASE_URL } from './endpoints';

// Export services
export * from './services/authService';
export * from './services/societyService';
export * from './services/userService';
export * from './services/chargeService';
export * from './services/paymentService';

// Registration completion function
import { registerUser } from './services/authService';
import { createSociety } from './services/societyService';
import { createFlatsBulk } from './services/userService';
import ErrorLogger from './errorLogger';

export const completeRegistration = async (registrationData: any) => {
  try {
    if (!registrationData) {
      throw new Error('Missing registration data');
    }

    console.log("Starting registration completion with data:", registrationData);
    
    // Extract data in the expected format
    const buildingInfo = registrationData.building || {};
    const ownerData = registrationData.owner || {};
    const flatsData = registrationData.flats || [];

    if (!buildingInfo || !ownerData) {
      throw new Error('Missing essential registration data (building info or owner data)');
    }

    // 1. Create society
    console.log("Creating society...");
    const societyData = {
      buildingName: buildingInfo.name,
      address: buildingInfo.address,
      city: buildingInfo.city,
      postcode: buildingInfo.postal_code,
      totalFlats: buildingInfo.total_flats
    };
    
    console.log("Society data prepared:", societyData);
    const societyResponse = await createSociety(societyData);

    console.log("Society created:", societyResponse);
    
    if (!societyResponse || !societyResponse.id) {
      throw new Error("Failed to create society or missing society ID");
    }

    // 2. Create admin user
    console.log("Creating admin user...");
    const userResponse = await registerUser({
      firstName: ownerData.firstName,
      lastName: ownerData.lastName,
      email: ownerData.email,
      phone: ownerData.phone,
      password: ownerData.password,
      society_id: societyResponse.id
    });

    console.log("Admin user created:", userResponse);
    
    if (!userResponse || !userResponse.id) {
      throw new Error("Failed to create admin user");
    }

    // Create a user map for flat assignment
    const userMap: Record<string, number> = {
      [ownerData.email]: userResponse.id
    };

    // 3. Create flats
    console.log("Creating flats...");
    const formattedFlats = flatsData.map((flat: any) => ({
      flatName: flat.number,
      flatType: flat.flat_type === "TWO_BHK" ? "2bhk" : 
                flat.flat_type === "THREE_BHK" ? "3bhk" : "4bhk",
      owner: ownerData.email
    }));
    
    const flatsResponse = await createFlatsBulk(
      formattedFlats,
      societyResponse.id,
      userMap
    );

    console.log("Flats created:", flatsResponse);

    return {
      society: societyResponse,
      admin: userResponse,
      flats: flatsResponse
    };
  } catch (error: any) {
    const errorMessage = error.message || "Failed to complete registration";
    ErrorLogger.log(
      'Registration completion error',
      'error',
      error instanceof Error ? error : new Error(errorMessage)
    );
    throw error;
  }
};
