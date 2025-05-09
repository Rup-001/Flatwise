
export interface Payment {
  id: number;
  amount: number;
  status: string;
  payment_date: string;
  tran_id: string;
}

export interface Charge {
  name: string;
  amount: number;
}

export interface Resident {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  status: string;
}

export interface FlatResident {
  id: number;
  flat_id: number;
  resident_id: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  resident: Resident | null;
}

export interface Bill {
  id: number;
  user_id: number;
  flat_id: number;
  society_id: number;
  bill_month: string;
  status: 'PAID' | 'PENDING';
  total_amount: number;
  common_charges: Charge[];
  flat_charges: Charge[];
  flat: {
    id: number;
    number: string;
    flat_type: string;
  };
  society: {
    id: number;
    name: string;
  };
  payments: Payment[];
  owner?: {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    status: string;
  };
  residents?: {
    resident: Resident | null;
  } | null;
}

export interface BillSummary {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
