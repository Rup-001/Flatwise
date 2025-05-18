import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types for registration data
export interface OwnerFormValues {
  
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  society_id?: number;
}

export interface BuildingFormValues {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  totalFlats: number;
  society_id: number;
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
  const savedData = localStorage.getItem('registrationData');
  const initialState: RegistrationState = savedData
    ? JSON.parse(savedData)
    : {
        owner: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          society_id: 0
        },
        building: {
          name: '',
          address: '',
          city: '',
          state: '',
          country: 'Bangladesh',
          postal_code: '',
          totalFlats: 5,
          society_id: null
        },
        flats: [],
        payment: {
          promoCode: '',
        },
        completed: false,
      };
  
// const initialState: RegistrationState = {
  
//   owner: {
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     society_id: 0
//   },
//   building: {
//     name: '',
//     address: '',
//     city: '',
//     state: '',
//     country: 'Bangladesh',
//     postal_code: '',
//     totalFlats: 5,
//     society_id: null
//   },
//   flats: [],
//   payment: {
//     promoCode: '',
//   },
//   completed: false,
// };

const registrationReducer = (state: RegistrationState, action: RegistrationAction): RegistrationState => {
  console.log("reg context 1111")
  switch (action.type) {
    case 'SET_OWNER_DATA':
      console.log("Reducer - setting owner reg context:", action.payload);
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
  // setOwnerData: (data: OwnerFormValues) => void;
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
  console.log("reg context 2222")
  console.log("initialState", initialState)
  const [state, dispatch] = useReducer(registrationReducer, initialState);

  const setOwnerData = (data: OwnerFormValues) => {
    console.log("reg context 3333")
    console.log("setOwnerData", data)
    const updatedState = { ...state, owner: data };
    localStorage.setItem('registrationData', JSON.stringify(updatedState)); // ✅ Save to localStorage
  
    dispatch({ type: 'SET_OWNER_DATA', payload: data });
  };

  const setBuildingData = (data: BuildingFormValues) => {
    console.log("reg context 4444")
    dispatch({ type: 'SET_BUILDING_DATA', payload: data });
  };

  const setFlatsData = (data: FlatData[]) => {
    console.log("reg context 5555")
    dispatch({ type: 'SET_FLATS_DATA', payload: data });
  };

  const setPaymentData = (data: PaymentFormValues) => {
    console.log("reg context 6666")
    dispatch({ type: 'SET_PAYMENT_DATA', payload: data });
  };

  const setPaymentId = (id: number) => {
    console.log("reg context 7777")
    dispatch({ type: 'SET_PAYMENT_ID', payload: id });
  };

  const setCompleted = (completed: boolean) => {
    console.log("reg context 8888")
    dispatch({ type: 'SET_COMPLETED', payload: completed });
  };

  const setResult = (result: any) => {
    console.log("reg context 9999")
    dispatch({ type: 'SET_RESULT', payload: result });
  };

  const reset = () => {
    console.log("reg context 10 10 ")
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
  console.log("reg context 11 11 11")
  console.log("reg context 11 11 11 [context access]");
  const context = useContext(RegistrationContext);
  console.log("context.state from reg context:", context?.state);
  console.log("context.owner from reg context", context.state.owner); // ✅ Correct
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
