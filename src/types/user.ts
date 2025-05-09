
export interface SocietyUser {
  id: number;
  username?: string;
  fullname: string;
  alias?: string;
  email: string;
  phone: string;
  role_id?: number;
  society_id?: number;
  flat_id?: number | null;
  service_type?: string | null;
  pay_service_charge?: boolean;
  created_at?: string;
  updated_at?: string;
  status?: string;
}
