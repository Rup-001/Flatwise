
import { Flat as ContextFlat, ServiceCharge, PredefinedServiceCharge } from '@/context/AppContext';

/**
 * Helper to get amount for a specific flat type
 */
const getAmountForFlatType = (charge: ServiceCharge, flatType: string): number => {
  const amount = charge.amounts.find(a => a.flat_type === flatType);
  return amount ? amount.amount : 0;
};

/**
 * Convert ServiceCharge[] from context to form display model
 */
export const mapServiceChargesToFormData = (charges: ServiceCharge[]): any[] => {
  return charges.map(charge => ({
    predefined_service_charge_id: charge.predefined_service_charge_id,
    service_type: charge.service_type,
    amounts: charge.amounts,
    // Add any additional properties needed for form display
  }));
};

/**
 * Convert form data back to ServiceCharge[] for API
 */
export const mapFormDataToServiceCharges = (formData: any, society_id: number): any => {
  return {
    society_id,
    service_charges: formData.map((charge: any) => ({
      predefined_service_charge_id: charge.predefined_service_charge_id,
      amounts: charge.amounts
    }))
  };
};

/**
 * Add resident property to Flats from context to match FlatManagement component
 */
export const mapContextFlatsToFormFlats = (flats: ContextFlat[]): any[] => {
  return flats.map(flat => ({
    ...flat,
    resident: flat.ownerId ? 'Owner' : (flat.residentId ? 'Resident' : 'Vacant'),
  }));
};

// Predefined service charge types - for reference only, no longer used
const SERVICE_TYPES = [
  { id: 'security', label: 'Security Guard' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'water', label: 'Water Supply' },
  { id: 'electricity', label: 'Electricity (Common Areas)' },
  { id: 'gardening', label: 'Gardening' },
  { id: 'lift', label: 'Lift Maintenance' },
  { id: 'garbage', label: 'Garbage Collection' },
  { id: 'parking', label: 'Parking Management' },
  { id: 'gym', label: 'Gym Maintenance' },
  { id: 'swimming', label: 'Swimming Pool Maintenance' },
  { id: 'fire', label: 'Fire Safety' },
  { id: 'other', label: 'Other' },
];
