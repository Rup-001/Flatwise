
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { apiRequest, fetchSocietyUsers, ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';

export interface SocietyUser {
  id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string;
  status: string;
  role_id: number;
  society_id: number;
  owned_flats?: Array<{
    id: number;
    number: string;
    flat_type: string;
  }>;
  rented_flats?: Array<any>;
}

export interface SocietyUsersResponse {
  owners: SocietyUser[];
  residents: SocietyUser[];
}

export const useSocietyUsers = () => {
  const { society } = useAppContext();
  const [users, setUsers] = useState<SocietyUsersResponse>({ owners: [], residents: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = useCallback(async () => {
    if (!society.current?.id) return;
    
    try {
      setIsLoading(true);
      const societyId = society.current.id;
      const response = await fetchSocietyUsers(societyId);
      setUsers(response);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [society.current?.id]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const inviteUsers = async (users: Array<{
    name: string;
    email: string;
    userType: "owner" | "resident";
    flatId?: string;
  }>) => {
    if (!society.current?.id) {
      toast.error('No active society selected');
      return { successful: [], failed: [] };
    }
    
    try {
      setIsLoading(true);
      
      // Map to API format
      const usersToInvite = users.map(user => ({
        fullname: user.name,
        email: user.email,
        role_id: user.userType === "owner" ? 2 : 3 // 2 for owner, 3 for resident
      }));
      
      // Use bulk invitation API
      const response = await apiRequest(
        `${ENDPOINTS.USERS}/invite/bulk`,
        "POST",
        {
          society_id: society.current.id,
          users: usersToInvite
        }
      );
      
      // Refresh users list after inviting
      await fetchUsers();
      
      return response;
    } catch (error: any) {
      console.error("Error inviting users:", error);
      toast.error(error.message || 'Failed to invite users');
      return { successful: [], failed: users };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    users,
    isLoading,
    error,
    fetchUsers,
    inviteUsers,
    owners: users.owners || [],
    residents: users.residents || []
  };
};

export default useSocietyUsers;
