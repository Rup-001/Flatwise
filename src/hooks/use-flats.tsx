import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { Flat } from '@/context/AppContext';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';

export interface FlatServiceCharge {
  predefined_service_charge_id: number;
  service_type: string;
  amount: number;
}

export interface FlatServiceChargesResponse {
  society_id: number;
  flat_type: string;
  service_charges: FlatServiceCharge[];
  total: number;
}

export interface PredefinedServiceCharge {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserServiceCharge {
  id: number;
  flat_id: number;
  predefined_service_charge_id: number;
  amount: string;
  predefined_service_charge: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface SocietyFlatResponse {
  id: number;
  number: string;
  society_id: number;
  owner_id: number | null;
  resident_id: number | null;
  flat_type: string;
  created_at: string;
  society: {
    id: number;
    name: string;
    service_charges: Array<{
      id: number;
      society_id: number;
      predefined_service_charge_id: number;
      flat_type: string;
      amount: string;
      created_at: string;
      predefined_service_charge: {
        id: number;
        name: string;
        description: string | null;
      };
    }>;
  };
  owner: {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    status: string;
  } | null;
  residents: Array<any>;
  user_service_charges: UserServiceCharge[];
}

export const useFlats = () => {
  const { 
    flats, 
    fetchFlats, 
    updateFlat, 
    addFlat, 
    deleteFlat,
    society
  } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flatServiceCharges, setFlatServiceCharges] = useState<Record<string, FlatServiceChargesResponse>>({});
  const [predefinedCharges, setPredefinedCharges] = useState<PredefinedServiceCharge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [societyFlats, setSocietyFlats] = useState<SocietyFlatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const isMounted = useRef(true);
  const loadingRef = useRef(false);
  const initialFetchAttempted = useRef(false);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (!society.current?.id || initialFetchAttempted.current) return;
    
    initialFetchAttempted.current = true;
    refreshSocietyFlats();
  }, [society.current?.id]);
  
  const convertToApiType = (uiType: string): string | null => {
    switch(uiType) {
      case '2 BHK': return 'TWO_BHK';
      case '3 BHK': return 'THREE_BHK';
      case '4 BHK': return 'FOUR_BHK';
      default: return null;
    }
  };
  
  const convertFromApiType = (apiType: string): string => {
    switch(apiType) {
      case 'TWO_BHK': return '2 BHK';
      case 'THREE_BHK': return '3 BHK';
      case 'FOUR_BHK': return '4 BHK';
      default: return apiType;
    }
  };
  
  const fetchFlatTypeCharges = async (societyId: number, flatType: string): Promise<FlatServiceChargesResponse | null> => {
    try {
      console.log(`Fetching charges for ${flatType}`);
      return await apiRequest<FlatServiceChargesResponse>(
        `${ENDPOINTS.SERVICE_CHARGES}/society/${societyId}/flat-type/${flatType}`,
        "GET"
      );
    } catch (error) {
      console.error(`Error fetching charges for ${flatType}:`, error);
      return null;
    }
  };

  const fetchFlat = useCallback(async (flatId: string) => {
    try {
      return await apiRequest<any>(`${ENDPOINTS.FLATS}/${flatId}`, "GET");
    } catch (error) {
      console.error("Error fetching flat:", error);
      throw error;
    }
  }, []);

  const handleUpdateFlat = useCallback(async (flatId: string, data: Partial<Flat>) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        id: Number(flatId),
        number: data.number || '',
        society_id: society.current?.id || 0,
        owner_id: data.ownerId ? Number(data.ownerId) : null
      };
      
      await apiRequest(
        `${ENDPOINTS.FLATS}/${flatId}`,
        "PATCH",
        updateData
      );
      
      setSocietyFlats(prev => 
        prev.map(flat => 
          flat.id === Number(flatId) 
            ? { 
                ...flat, 
                number: data.number || flat.number,
                owner_id: data.ownerId ? Number(data.ownerId) : flat.owner_id
              } 
            : flat
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating flat:", error);
      toast.error("Failed to update flat");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [society.current?.id]);

  const handleAddFlat = useCallback(async (data: Omit<Flat, "id">) => {
    setIsSubmitting(true);
    try {
      await addFlat(data);
      return true;
    } catch (error) {
      console.error("Error adding flat:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [addFlat]);

  const handleDeleteFlat = useCallback(async (flatId: string) => {
    setIsSubmitting(true);
    try {
      await deleteFlat(flatId);
      return true;
    } catch (error) {
      console.error("Error deleting flat:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteFlat]);

  const refreshSocietyFlats = useCallback(async () => {
    if (!society.current?.id || loadingRef.current) return;
    
    try {
      setIsLoading(true);
      loadingRef.current = true;
      setError(null);
      
      const societyId = society.current.id;
      console.log(`Refreshing society flats for society ID: ${societyId}`);
      
      // First fetch predefined charges
      try {
        const predefinedChargesData = await apiRequest<PredefinedServiceCharge[]>(
          ENDPOINTS.PREDEFINED_SERVICE_CHARGES,
          "GET"
        );
        
        if (isMounted.current) {
          setPredefinedCharges(predefinedChargesData);
          console.log("Predefined charges loaded:", predefinedChargesData.length);
        }
      } catch (err) {
        console.error("Error fetching predefined charges:", err);
      }
      
      // Then fetch society flats
      try {
        const societyFlatsData = await apiRequest<SocietyFlatResponse[]>(
          `${ENDPOINTS.FLATS}/society/${societyId}`,
          "GET"
        );
        
        if (isMounted.current) {
          console.log(`Received ${societyFlatsData.length} flats`);
          
          // Handle duplicate service charges
          const processedFlats = societyFlatsData.map(flat => {
            // Filter out duplicate service charges by keeping only unique predefined_service_charge_id + flat_type combinations
            const uniqueServiceCharges = flat.society.service_charges.reduce((acc, current) => {
              const key = `${current.predefined_service_charge_id}_${current.flat_type}`;
              if (!acc[key] || new Date(current.created_at) > new Date(acc[key].created_at)) {
                acc[key] = current;
              }
              return acc;
            }, {} as Record<string, any>);
            
            return {
              ...flat,
              society: {
                ...flat.society,
                service_charges: Object.values(uniqueServiceCharges)
              }
            };
          });
          
          setSocietyFlats(processedFlats);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching society flats:", err);
        if (isMounted.current) {
          setError(err.message || "Failed to load flats data");
          toast.error("Failed to load flats data");
        }
      }
      
    } catch (error: any) {
      console.error("Error refreshing society flats:", error);
      if (isMounted.current) {
        toast.error("Failed to refresh flats data");
        setError(error.message || "Failed to refresh flats data");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [society.current?.id]);

  const addUserServiceCharge = async (flatId: number, chargeTypeId: number, amount: number) => {
    try {
      console.log(`Adding charge: ${chargeTypeId} with amount ${amount} to flat ${flatId}`);
      const response = await apiRequest<UserServiceCharge>(
        ENDPOINTS.USER_SERVICE_CHARGES,
        "POST",
        {
          flat_id: flatId,
          predefined_service_charge_id: chargeTypeId,
          amount: amount
        }
      );
      
      setSocietyFlats(prevFlats => 
        prevFlats.map(flat => {
          if (flat.id === flatId) {
            return {
              ...flat,
              user_service_charges: [...flat.user_service_charges, response]
            };
          }
          return flat;
        })
      );
      
      return response;
    } catch (error) {
      console.error("Error adding user service charge:", error);
      toast.error("Failed to add service charge");
      throw error;
    }
  };

  return {
    flats: flats.items,
    societyFlats,
    isLoading: flats.loading || isLoading,
    error: flats.error || error,
    isSubmitting,
    updateFlat: handleUpdateFlat,
    addFlat: handleAddFlat,
    deleteFlat: handleDeleteFlat,
    fetchFlat,
    flatServiceCharges,
    predefinedCharges,
    convertFromApiType,
    convertToApiType,
    addUserServiceCharge,
    refreshSocietyFlats
  };
};

export default useFlats;
