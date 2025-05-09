import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types for registration data
export interface OwnerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface BuildingFormValues {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  totalFlats: number;
}

export interface FlatData {
  number: string;
  flat_type: string;
}

export interface PaymentFormValues {
  promoCode?: string;
}

export interface RegistrationState {
  owner: OwnerFormValues;
  building: BuildingFormValues;
  flats: FlatData[];
  payment: PaymentFormValues;
  payment_id?: number;
  completed: boolean;
  result?: any;
}

type RegistrationAction = 
  | { type: 'SET_OWNER_DATA'; payload: OwnerFormValues }
  | { type: 'SET_BUILDING_DATA'; payload: BuildingFormValues }
  | { type: 'SET_FLATS_DATA'; payload: FlatData[] }
  | { type: 'SET_PAYMENT_DATA'; payload: PaymentFormValues }
  | { type: 'SET_PAYMENT_ID'; payload: number }
  | { type: 'SET_COMPLETED'; payload: boolean }
  | { type: 'SET_RESULT'; payload: any }
  | { type: 'RESET' };

const initialState: RegistrationState = {
  owner: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  },
  building: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Bangladesh',
    postal_code: '',
    totalFlats: 5,
  },
  flats: [],
  payment: {
    promoCode: '',
  },
  completed: false,
};

const registrationReducer = (state: RegistrationState, action: RegistrationAction): RegistrationState => {
  switch (action.type) {
    case 'SET_OWNER_DATA':
      return { ...state, owner: action.payload };
    case 'SET_BUILDING_DATA':
      return { ...state, building: action.payload };
    case 'SET_FLATS_DATA':
      return { ...state, flats: action.payload };
    case 'SET_PAYMENT_DATA':
      return { ...state, payment: action.payload };
    case 'SET_PAYMENT_ID':
      return { ...state, payment_id: action.payload };
    case 'SET_COMPLETED':
      return { ...state, completed: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface RegistrationContextProps {
  state: RegistrationState;
  setOwnerData: (data: OwnerFormValues) => void;
  setBuildingData: (data: BuildingFormValues) => void;
  setFlatsData: (data: FlatData[]) => void;
  setPaymentData: (data: PaymentFormValues) => void;
  setPaymentId: (id: number) => void;
  setCompleted: (completed: boolean) => void;
  setResult: (result: any) => void;
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextProps | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(registrationReducer, initialState);

  const setOwnerData = (data: OwnerFormValues) => {
    dispatch({ type: 'SET_OWNER_DATA', payload: data });
  };

  const setBuildingData = (data: BuildingFormValues) => {
    dispatch({ type: 'SET_BUILDING_DATA', payload: data });
  };

  const setFlatsData = (data: FlatData[]) => {
    dispatch({ type: 'SET_FLATS_DATA', payload: data });
  };

  const setPaymentData = (data: PaymentFormValues) => {
    dispatch({ type: 'SET_PAYMENT_DATA', payload: data });
  };

  const setPaymentId = (id: number) => {
    dispatch({ type: 'SET_PAYMENT_ID', payload: id });
  };

  const setCompleted = (completed: boolean) => {
    dispatch({ type: 'SET_COMPLETED', payload: completed });
  };

  const setResult = (result: any) => {
    dispatch({ type: 'SET_RESULT', payload: result });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <RegistrationContext.Provider value={{
      state,
      setOwnerData,
      setBuildingData,
      setFlatsData,
      setPaymentData,
      setPaymentId,
      setCompleted,
      setResult,
      reset
    }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
