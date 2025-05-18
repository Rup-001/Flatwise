import { apiRequest } from '../apiClient';
import { ENDPOINTS, API_BASE_URL } from '../endpoints';
import ErrorLogger from '../errorLogger';

// Payment service functions
export const calculatePrice = async (data: {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  location_lat: number;
  location_lng: number;
  flats: Array<{
    number: string;
    flat_type: string;
  }>;
  user_emails: string[];
}) => {
  try {
    return apiRequest<{
      base_price: number;
      tax: number;
      total_price: number;
      flat_counts: {
        TWO_BHK: number;
        THREE_BHK: number;
        FOUR_BHK: number;
      };
      user_count: number;
      location_multiplier: number;
    }>(
      `${API_BASE_URL}/pricing/calculate-price`,
      "POST",
      data
    );
  } catch (error) {
    const errorMessage = "Failed to calculate price";
    ErrorLogger.log(errorMessage, "error", error instanceof Error ? error : new Error(errorMessage));
    return Promise.reject({ message: errorMessage });
  }
};

export const applyPromoCode = async (data: {
  promo_code: string;
  original_amount: number;
  user_email: string;
  location_lat: number;
  location_lng: number;
  flats: Array<{
    number: string;
    flat_type: string;
  }>;
}) => {
  try {
    return apiRequest<{
      original_amount: number;
      discount: number;
      discounted_amount: number;
      promo_code: string;
    }>(
      `${API_BASE_URL}/pricing/apply-promo`,
      "POST",
      data
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to apply promo code";
    ErrorLogger.log(errorMessage, "error", error instanceof Error ? error : new Error(errorMessage));
    return Promise.reject({ message: errorMessage });
  }
};

export const initiatePayment = async (data: {
  user_id: number;
  flat_id: number;
  bill_id: number;
  society_id: number;
  amount: number;
  payment_month: string;
}) => {
  try {
    console.log('Initiating payment with data:', data);
    
    // Validate all required fields
    if (!data.user_id || !data.flat_id || !data.bill_id || !data.society_id || !data.amount) {
      throw new Error('Missing required payment data');
    }
    
    const response = await apiRequest<{ payment_url: string }>(
      `${ENDPOINTS.PAYMENTS}/initiate`,
      'POST',
      data
    );
    
    if (response && response.payment_url) {
      return response;
    } else {
      throw new Error('No payment URL received from server');
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error;
  }
};

export const initiateRegistrationPayment = async (data: {
  email: string;
  amount: number;
  promo_code?: string;
  user_id?: number
  society_id: number


}) => {
  try {
    console.log("Initiating registration payment with data:", data);
    
    // const response = await apiRequest(
    // `${API_BASE_URL}/subscriptions/initiate`,
    //   "POST",
    //   data
    // )
      
    const response = await apiRequest<{
      payment_url: string;
      payment_id: number;
    }>(
      `${API_BASE_URL}/subscriptions/initiate`,
      "POST",
      data
    );
    
    if (!response ) {
      throw new Error("No payment URL received from the server");
    }
    
    return response;
  } catch (error: any) {
    const errorMessage = error.message || "Failed to initiate registration payment";
    ErrorLogger.log(
      'Registration payment error', 
      'error', 
      error instanceof Error ? error : new Error(errorMessage),
      { paymentData: data }
    );
    throw error;
  }
};
