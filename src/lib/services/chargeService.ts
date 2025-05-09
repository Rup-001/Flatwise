
import { apiRequest } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import ErrorLogger from '../errorLogger';

// Service charges API calls
export const fetchPredefinedServiceCharges = async () => {
  try {
    return apiRequest<Array<{id: number, name: string, description: string|null, created_at: string}>>(
      ENDPOINTS.PREDEFINED_SERVICE_CHARGES, 
      "GET"
    );
  } catch (error) {
    const errorMessage = "Failed to fetch predefined service charges";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
};

export const fetchSocietyServiceCharges = async (societyId: number) => {
  try {
    if (!societyId) {
      console.error("Missing society_id for fetchSocietyServiceCharges call");
      throw new Error("Society ID is required to fetch service charges");
    }
    
    console.log(`Fetching service charges for society ${societyId}`);
    return apiRequest<{
      society_id: number,
      service_charges: Array<{
        predefined_service_charge_id: number,
        service_type: string,
        amounts: Array<{
          flat_type: string,
          amount: number
        }>
      }>
    }>(
      `${ENDPOINTS.SERVICE_CHARGES}/society/${societyId}`, 
      "GET"
    );
  } catch (error) {
    const errorMessage = "Failed to fetch society service charges";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
};

export const saveServiceChargesBulk = async (
  societyId: number,
  serviceCharges: Array<{
    predefined_service_charge_id: number,
    amounts: Array<{
      flat_type: string,
      amount: number
    }>
  }>
) => {
  try {
    return apiRequest<any>(
      ENDPOINTS.SERVICE_CHARGES_BULK,
      "POST",
      {
        society_id: societyId,
        service_charges: serviceCharges
      }
    );
  } catch (error) {
    const errorMessage = "Failed to save service charges";
    ErrorLogger.log(errorMessage, "error");
    return Promise.reject({ message: errorMessage });
  }
};
