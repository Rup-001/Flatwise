
import { useQuery } from '@tanstack/react-query';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { Bill } from '@/types/bill';
import { useAppContext } from '@/context/AppContext';

export const useBills = () => {
  const { auth } = useAppContext();
  const societyId = auth.user?.society_id;
  const userId = auth.user?.id;
  const isAdmin = auth.user?.role_id === 1 || auth.user?.role_id === 2;

  console.log("useBills hook initialized with:", { 
    societyId, 
    userId, 
    isAdmin,
    authUser: auth.user 
  });

  const { data: userBills, isLoading: userBillsLoading } = useQuery({
    queryKey: ['bills', 'user', societyId, userId],
    queryFn: async () => {
      if (!societyId || !userId) {
        console.error('Missing society_id or user_id for bills API call', { societyId, userId });
        return [];
      }
      console.log(`Fetching user bills for society ${societyId} and user ${userId}`);
      const result = await apiRequest<Bill[]>(`${ENDPOINTS.BILLS}/society/${societyId}/user/${userId}`, 'GET');
      console.log('User bills result:', result);
      return result || [];
    },
    enabled: !!societyId && !!userId,
  });

  const { data: societyBills, isLoading: societyBillsLoading } = useQuery({
    queryKey: ['bills', 'society', societyId],
    queryFn: async () => {
      if (!societyId) {
        console.error('Missing society_id for society bills API call', { societyId });
        return [];
      }
      console.log(`Fetching society bills for society ${societyId}`);
      const result = await apiRequest<Bill[]>(`${ENDPOINTS.BILLS}/society/${societyId}`, 'GET');
      console.log('Society bills result:', result);
      return result || [];
    },
    enabled: !!societyId && isAdmin,
  });

  return {
    userBills: userBills || [],
    societyBills: societyBills || [],
    isLoading: userBillsLoading || (isAdmin ? societyBillsLoading : false),
  };
};
