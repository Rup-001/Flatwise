
import { useRegistration as useRegistrationContext } from '@/context/RegistrationContext';

// This is a wrapper around the useRegistrationContext hook
// This makes it easier to switch implementations in the future if needed
export const useRegistration = () => {
  const context = useRegistrationContext();
  
  return {
    ...context,
    // Override the setOwnerData function to ensure all required fields are present
    setOwnerData: (data: any) => {
      // Ensure all required fields are present with defaults if needed
      const ownerData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || '',
        confirmPassword: data.confirmPassword || '',
      };
      
      context.setOwnerData(ownerData);
    }
  };
};

export default useRegistration;
