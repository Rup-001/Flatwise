
export interface Flat {
  id: number;
  number: string;
  society_id: number;
  owner_id?: number | null;
  resident_id?: number | null;
  flat_type: "TWO_BHK" | "THREE_BHK" | "FOUR_BHK";
  created_at?: string;
}
