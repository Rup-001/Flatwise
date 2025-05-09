
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback  } from "react";
import { apiRequest, ENDPOINTS, fetchPredefinedServiceCharges, fetchSocietyServiceCharges, saveServiceChargesBulk } from "../lib/api";
import { toast } from "sonner";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "resident" | "admin";
  profileCompleted: boolean;
  society_id?: number;
  role_id?: number;
  pay_service_charge?: boolean;
  fullname?: string;
}

export interface Society {
  id: number;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
  total_flats: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE';
}

export interface Flat {
  id: string;
  number: string;
  name: string;
  type: string;
  size: string;
  floor: string;
  occupied: boolean;
  ownerId?: string;
  residentId?: string;
  extraCharges: {
    id: string;
    type: string;
    amount: number;
    description: string;
  }[];
  basicChargeAmount: number;
}

export interface Invitation {
  id: string;
  email: string;
  role: "owner" | "resident";
  status: "pending" | "accepted" | "rejected";
  flatId?: string;
  createdAt: string;
}

export interface ServiceCharge {
  predefined_service_charge_id: number;
  service_type: string;
  amounts: Array<{
    flat_type: string;
    amount: number;
  }>;
}

export interface PredefinedServiceCharge {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

// App State
interface AppState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
  };
  society: {
    current: Society | null;
    loading: boolean;
    error: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE' | null;
  };
  flats: {
    items: Flat[];
    loading: boolean;
    error: string | null;
  };
  invitations: {
    items: Invitation[];
    loading: boolean;
    error: string | null;
  };
  serviceCharges: {
    items: ServiceCharge[];
    loading: boolean;
    error: string | null;
  };
  predefinedServiceCharges: {
    items: PredefinedServiceCharge[];
    loading: boolean;
    error: string | null;
  };
}

// Initial State
const initialState: AppState = {
  auth: {
    isAuthenticated: !!localStorage.getItem("authToken"),
    user: null,
    loading: false,
  },
  society: {
    current: null,
    loading: false,
    error: null,
    status: null,
  },
  flats: {
    items: [],
    loading: false,
    error: null,
  },
  invitations: {
    items: [],
    loading: false,
    error: null,
  },
  serviceCharges: {
    items: [],
    loading: false,
    error: null,
  },
  predefinedServiceCharges: {
    items: [],
    loading: false,
    error: null,
  },
};

// Action Types
type ActionType =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "SOCIETY_LOADING" }
  | { type: "SOCIETY_SUCCESS"; payload: Society }
  | { type: "SOCIETY_ERROR"; payload: string }
  | { type: "SOCIETY_STATUS_UPDATE"; payload: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE' }
  | { type: "FLATS_LOADING" }
  | { type: "FLATS_SUCCESS"; payload: Flat[] }
  | { type: "FLATS_ERROR"; payload: string }
  | { type: "FLAT_UPDATE"; payload: Flat }
  | { type: "FLAT_ADD"; payload: Flat }
  | { type: "FLAT_DELETE"; payload: string }
  | { type: "INVITATIONS_LOADING" }
  | { type: "INVITATIONS_SUCCESS"; payload: Invitation[] }
  | { type: "INVITATIONS_ERROR"; payload: string }
  | { type: "INVITATION_ADD"; payload: Invitation }
  | { type: "INVITATION_UPDATE"; payload: Invitation }
  | { type: "INVITATION_DELETE"; payload: string }
  | { type: "SERVICE_CHARGES_LOADING" }
  | { type: "SERVICE_CHARGES_SUCCESS"; payload: ServiceCharge[] }
  | { type: "SERVICE_CHARGES_ERROR"; payload: string }
  | { type: "PREDEFINED_SERVICE_CHARGES_LOADING" }
  | { type: "PREDEFINED_SERVICE_CHARGES_SUCCESS"; payload: PredefinedServiceCharge[] }
  | { type: "PREDEFINED_SERVICE_CHARGES_ERROR"; payload: string };

// Reducer
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        auth: { ...state.auth, loading: true },
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
          loading: false,
        },
      };
    case "AUTH_ERROR":
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          loading: false,
        },
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          loading: false,
        },
        society: {
          ...state.society,
          status: null
        }
      };

    case "SOCIETY_LOADING":
      return {
        ...state,
        society: { ...state.society, loading: true, error: null },
      };
    case "SOCIETY_SUCCESS":
      return {
        ...state,
        society: { 
          current: action.payload, 
          loading: false, 
          error: null,
          status: action.payload.status || state.society.status 
        },
      };
    case "SOCIETY_ERROR":
      return {
        ...state,
        society: { ...state.society, loading: false, error: action.payload },
      };
    case "SOCIETY_STATUS_UPDATE":
      return {
        ...state,
        society: { ...state.society, status: action.payload },
      };

    case "FLATS_LOADING":
      return {
        ...state,
        flats: { ...state.flats, loading: true, error: null },
      };
    case "FLATS_SUCCESS":
      return {
        ...state,
        flats: { items: action.payload, loading: false, error: null },
      };
    case "FLATS_ERROR":
      return {
        ...state,
        flats: { ...state.flats, loading: false, error: action.payload },
      };
    case "FLAT_UPDATE":
      return {
        ...state,
        flats: {
          ...state.flats,
          items: state.flats.items.map((flat) =>
            flat.id === action.payload.id ? action.payload : flat
          ),
        },
      };
    case "FLAT_ADD":
      return {
        ...state,
        flats: {
          ...state.flats,
          items: [...state.flats.items, action.payload],
        },
      };
    case "FLAT_DELETE":
      return {
        ...state,
        flats: {
          ...state.flats,
          items: state.flats.items.filter((flat) => flat.id !== action.payload),
        },
      };

    case "INVITATIONS_LOADING":
      return {
        ...state,
        invitations: { ...state.invitations, loading: true, error: null },
      };
    case "INVITATIONS_SUCCESS":
      return {
        ...state,
        invitations: { items: action.payload, loading: false, error: null },
      };
    case "INVITATIONS_ERROR":
      return {
        ...state,
        invitations: { ...state.invitations, loading: false, error: action.payload },
      };
    case "INVITATION_ADD":
      return {
        ...state,
        invitations: {
          ...state.invitations,
          items: [...state.invitations.items, action.payload],
        },
      };
    case "INVITATION_UPDATE":
      return {
        ...state,
        invitations: {
          ...state.invitations,
          items: state.invitations.items.map((invitation) =>
            invitation.id === action.payload.id ? action.payload : invitation
          ),
        },
      };
    case "INVITATION_DELETE":
      return {
        ...state,
        invitations: {
          ...state.invitations,
          items: state.invitations.items.filter((invitation) => invitation.id !== action.payload),
        },
      };

    case "SERVICE_CHARGES_LOADING":
      return {
        ...state,
        serviceCharges: { ...state.serviceCharges, loading: true, error: null },
      };
    case "SERVICE_CHARGES_SUCCESS":
      return {
        ...state,
        serviceCharges: { items: action.payload, loading: false, error: null },
      };
    case "SERVICE_CHARGES_ERROR":
      return {
        ...state,
        serviceCharges: { ...state.serviceCharges, loading: false, error: action.payload },
      };

    case "PREDEFINED_SERVICE_CHARGES_LOADING":
      return {
        ...state,
        predefinedServiceCharges: { ...state.predefinedServiceCharges, loading: true, error: null },
      };
    case "PREDEFINED_SERVICE_CHARGES_SUCCESS":
      return {
        ...state,
        predefinedServiceCharges: { items: action.payload, loading: false, error: null },
      };
    case "PREDEFINED_SERVICE_CHARGES_ERROR":
      return {
        ...state,
        predefinedServiceCharges: { ...state.predefinedServiceCharges, loading: false, error: action.payload },
      };

    default:
      return state;
  }
};

// Context
interface AppContextType extends AppState {
  login: (user: {
    id: string;
    name: string;
    email: string;
    role: "owner" | "resident" | "admin";
    profileCompleted: boolean;
    society_id?: number;
    role_id?: number;
    pay_service_charge?: boolean;
  }) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  fetchSociety: (societyId?: number) => Promise<void>;
  updateSocietyStatus: (status: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE') => void;
  fetchFlats: () => Promise<void>;
  updateFlat: (flatId: string, flatData: Partial<Flat>) => Promise<void>;
  addFlat: (flatData: Omit<Flat, "id">) => Promise<void>;
  deleteFlat: (flatId: string) => Promise<void>;
  fetchInvitations: () => Promise<void>;
  sendInvitation: (invitationData: Partial<Invitation>) => Promise<void>;
  updateInvitation: (invitationId: string, data: Partial<Invitation>) => Promise<void>;
  deleteInvitation: (invitationId: string) => Promise<void>;
  fetchServiceCharges: () => Promise<void>;
  updateServiceCharges: (chargesData: ServiceCharge[]) => Promise<void>;
  fetchPredefinedCharges: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !state.auth.user) {
      fetchUserProfile();
    }
  }, []);

  const login = async (user: {
    id: string;
    name: string;
    email: string;
    role: "owner" | "resident" | "admin";
    profileCompleted: boolean;
    society_id?: number;
    role_id?: number;
    pay_service_charge?: boolean;
  }) => {
    dispatch({ type: "AUTH_SUCCESS", payload: user });
    
    if (user.society_id) {
      try {
        fetchSociety(user.society_id);
      } catch (error) {
        console.error("Error fetching society after login:", error);
      }
    }
    else if (user.id) {
      try {
        const response = await apiRequest<User>(`${ENDPOINTS.USERS}/profile`, "GET");
        if (response.society_id) {
          fetchSociety(response.society_id);
        }
      } catch (error) {
        console.error("Error fetching user profile after login:", error);
      }
    }
    
    toast.success("Login successful");
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    dispatch({ type: "AUTH_LOGOUT" });
    toast.info("You have been logged out");
  };

  const updateSocietyStatus = (status: 'ACTIVE' | 'INACTIVE' | 'PAYMENT_DUE') => {
    dispatch({ type: "SOCIETY_STATUS_UPDATE", payload: status });
  };

  const register = async (userData: any) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await apiRequest<{ token: string; user: User }>(
        `${ENDPOINTS.AUTH}/register`,
        "POST",
        userData
      );
      
      localStorage.setItem("authToken", response.token);
      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
      toast.success("Registration successful");
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: "Registration failed" });
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    dispatch({ type: "AUTH_START" });
    try {
      const user = await apiRequest<User>(`${ENDPOINTS.USERS}/profile`, "GET");
      console.log("Fetched user profile1111:", user);

      dispatch({ type: "AUTH_SUCCESS", payload: user });
      
      if (user.society_id) {
        fetchSociety(user.society_id);
        console.log("Fetched user profile22222:", user.society_id);

      }
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: "Failed to fetch user profile" });
      logout();
      throw error;
    }
  };

  const fetchSociety = async (societyId?: number) => {
    console.log("first")
    dispatch({ type: "SOCIETY_LOADING" });
    try {
      const endpoint = societyId 
        ? `${ENDPOINTS.SOCIETIES}/${societyId}` 
        : `${ENDPOINTS.SOCIETIES}/current`;
        
      const society = await apiRequest<Society>(endpoint, "GET");
      dispatch({ type: "SOCIETY_SUCCESS", payload: society });
      
      if (society.status) {
        updateSocietyStatus(society.status);
      }
      
    } catch (error) {
      dispatch({ type: "SOCIETY_ERROR", payload: "Failed to fetch society" });
      throw error;
    }
  };

  const fetchFlats = async () => {
    dispatch({ type: "FLATS_LOADING" });
    try {
      const flats = await apiRequest<Flat[]>(ENDPOINTS.FLATS, "GET");
      dispatch({ type: "FLATS_SUCCESS", payload: flats });
    } catch (error) {
      dispatch({ type: "FLATS_ERROR", payload: "Failed to fetch flats" });
      throw error;
    }
  };

  const updateFlat = async (flatId: string, flatData: Partial<Flat>) => {
    try {
      const updatedFlat = await apiRequest<Flat>(
        `${ENDPOINTS.FLATS}/${flatId}`,
        "PUT",
        flatData
      );
      dispatch({ type: "FLAT_UPDATE", payload: updatedFlat });
      toast.success("Flat updated successfully");
    } catch (error) {
      toast.error("Failed to update flat");
      throw error;
    }
  };

  const addFlat = async (flatData: Omit<Flat, "id">) => {
    try {
      const newFlat = await apiRequest<Flat>(ENDPOINTS.FLATS, "POST", flatData);
      dispatch({ type: "FLAT_ADD", payload: newFlat });
      toast.success("Flat added successfully");
    } catch (error) {
      toast.error("Failed to add flat");
      throw error;
    }
  };

  const deleteFlat = async (flatId: string) => {
    try {
      await apiRequest(`${ENDPOINTS.FLATS}/${flatId}`, "DELETE");
      dispatch({ type: "FLAT_DELETE", payload: flatId });
      toast.success("Flat deleted successfully");
    } catch (error) {
      toast.error("Failed to delete flat");
      throw error;
    }
  };

  const fetchInvitations = async () => {
    dispatch({ type: "INVITATIONS_LOADING" });
    try {
      const invitations = await apiRequest<Invitation[]>(ENDPOINTS.INVITATIONS, "GET");
      dispatch({ type: "INVITATIONS_SUCCESS", payload: invitations });
    } catch (error) {
      dispatch({ type: "INVITATIONS_ERROR", payload: "Failed to fetch invitations" });
      throw error;
    }
  };

  const sendInvitation = async (invitationData: Partial<Invitation>) => {
    try {
      const newInvitation = await apiRequest<Invitation>(
        ENDPOINTS.INVITATIONS,
        "POST",
        invitationData
      );
      dispatch({ type: "INVITATION_ADD", payload: newInvitation });
      toast.success("Invitation sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
      throw error;
    }
  };

  const updateInvitation = async (invitationId: string, data: Partial<Invitation>) => {
    try {
      const updatedInvitation = await apiRequest<Invitation>(
        `${ENDPOINTS.INVITATIONS}/${invitationId}`,
        "PUT",
        data
      );
      dispatch({ type: "INVITATION_UPDATE", payload: updatedInvitation });
      toast.success("Invitation updated successfully");
    } catch (error) {
      toast.error("Failed to update invitation");
      throw error;
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      await apiRequest(`${ENDPOINTS.INVITATIONS}/${invitationId}`, "DELETE");
      dispatch({ type: "INVITATION_DELETE", payload: invitationId });
      toast.success("Invitation deleted successfully");
    } catch (error) {
      toast.error("Failed to delete invitation");
      throw error;
    }
  };

  const fetchServiceCharges = useCallback (async () => {
    dispatch({ type: "SERVICE_CHARGES_LOADING" });


    try {
      if (!state.auth.user?.society_id) {
        
        throw new Error("No society ID found");
      }
      
      const response = await fetchSocietyServiceCharges(state.auth.user.society_id);
      dispatch({ type: "SERVICE_CHARGES_SUCCESS", payload: response.service_charges });
    } catch (error) {
      dispatch({ 
        type: "SERVICE_CHARGES_ERROR", 
        payload: "Failed to fetch service charges" 
      });
      throw error;
    }
  } , [state.auth.user?.society_id]);

  const updateServiceCharges = async (chargesData: ServiceCharge[]) => {
    try {
      console.log("aaa")
      if (!state.auth.user?.society_id) {
        throw new Error("No society ID found");
      }
      console.log("bbb")
      const preparedData = chargesData.map(charge => ({
        predefined_service_charge_id: charge.predefined_service_charge_id,
        amounts: charge.amounts
      }));
      console.log("ccc")
      await saveServiceChargesBulk(state.auth.user.society_id, preparedData);
      console.log("ddd")
      dispatch({ type: "SERVICE_CHARGES_SUCCESS", payload: chargesData });
      console.log("eee")
      toast.success("Service charges updated successfully");
      console.log("fff")
    } catch (error) {
      toast.error("Failed to update service charges");
      throw error;
    }
  };

  const fetchPredefinedCharges = useCallback (async () => {
    dispatch({ type: "PREDEFINED_SERVICE_CHARGES_LOADING" });
    try {
      const charges = await fetchPredefinedServiceCharges();
      dispatch({ type: "PREDEFINED_SERVICE_CHARGES_SUCCESS", payload: charges });
    } catch (error) {
      dispatch({ 
        type: "PREDEFINED_SERVICE_CHARGES_ERROR", 
        payload: "Failed to fetch predefined service charges" 
      });
      throw error;
    }
  },[])

  const contextValue: AppContextType = {
    ...state,
    login,
    logout,
    register,
    fetchUserProfile,
    fetchSociety,
    updateSocietyStatus,
    fetchFlats,
    updateFlat,
    addFlat,
    deleteFlat,
    fetchInvitations,
    sendInvitation,
    updateInvitation,
    deleteInvitation,
    fetchServiceCharges,
    updateServiceCharges,
    fetchPredefinedCharges,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
