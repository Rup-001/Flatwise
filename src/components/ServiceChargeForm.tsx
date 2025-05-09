
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ResponsiveTable from '@/components/ui/responsive-table';
import { PredefinedServiceCharge, ServiceCharge } from '@/context/AppContext';

export interface ServiceChargeFormProps {
  onSubmit: (data: ServiceCharge[]) => void;
  initialData: ServiceCharge[];
  predefinedServiceCharges: PredefinedServiceCharge[];
}

const ServiceChargeForm: React.FC<ServiceChargeFormProps> = ({ 
  onSubmit, 
  initialData = [], 
  predefinedServiceCharges = []
}) => {
  const [charges, setCharges] = useState<ServiceCharge[]>([]);
  const [totals, setTotals] = useState({ twoBHK: 0, threeBHK: 0, fourBHK: 0 });
  const isMobile = useIsMobile();
  
  // Initialize charges when initial data changes
  useEffect(() => {
    console.log("88888")
    if (initialData.length > 0) {
      console.log("99999")
      setCharges(initialData);
    } else if (predefinedServiceCharges.length > 0 && charges.length === 0) {
      console.log("101010")
      // Create default empty charges if no initial data
      const defaultCharges = predefinedServiceCharges.slice(0, 1).map(preCharge => ({
        
        predefined_service_charge_id: preCharge.id,
        service_type: preCharge.name,
        amounts: [
          { flat_type: "TWO_BHK", amount: 0 },
          { flat_type: "THREE_BHK", amount: 0 },
          { flat_type: "FOUR_BHK", amount: 0 }
        ]
      }));
      console.log("11 11 11")
      setCharges(defaultCharges);
    }
  }, [initialData]); // Removed dependency that was causing issues

 
  
  
  // Calculate totals whenever charges change
  useEffect(() => {
    console.log("12 12 12")
    const newTotals = {
      twoBHK: 0,
      threeBHK: 0,
      fourBHK: 0
    };
    
    charges.forEach(charge => {
      charge.amounts.forEach(amount => {
        if (amount.flat_type === "TWO_BHK") {
          newTotals.twoBHK += Number(amount.amount);
        } else if (amount.flat_type === "THREE_BHK") {
          newTotals.threeBHK += Number(amount.amount);
        } else if (amount.flat_type === "FOUR_BHK") {
          newTotals.fourBHK += Number(amount.amount);
        }
      });
    });
    
    setTotals(newTotals);
  }, [charges]);

  // Use memoized handlers to prevent recreating functions on each render
  const handleAddCharge = useCallback(()  => {
    if (predefinedServiceCharges.length === 0) {
      toast.warning("No predefined service charges available");
      return;
    }
    
    // Find an unused predefined service charge
    const usedIds = charges.map(c => c.predefined_service_charge_id);
    const availableCharge = predefinedServiceCharges.find(psc => !usedIds.includes(psc.id));
    
    if (!availableCharge) {
      toast.warning("All predefined service charges are already added");
      return;
    }
    
    setCharges(prevCharges => [
      ...prevCharges, 
      {
        predefined_service_charge_id: availableCharge.id,
        service_type: availableCharge.name,
        amounts: [
          { flat_type: "TWO_BHK", amount: 0 },
          { flat_type: "THREE_BHK", amount: 0 },
          { flat_type: "FOUR_BHK", amount: 0 }
        ]
      }
    ]);
  }, [charges, predefinedServiceCharges]);

  const handleRemoveCharge = useCallback((index: number) => {
    if (charges.length > 1) {
      setCharges(prevCharges => {
        const updatedCharges = [...prevCharges];
        updatedCharges.splice(index, 1);
        return updatedCharges;
      });
    } else {
      toast.warning("You need at least one service charge");
    }
  }, [charges.length]);

  const handleServiceTypeChange = useCallback((value: string, index: number) => {
    const serviceChargeId = parseInt(value);
    const selectedService = predefinedServiceCharges.find(service => service.id === serviceChargeId);
    
    if (selectedService) {
      setCharges(prevCharges => {
        const updatedCharges = [...prevCharges];
        updatedCharges[index].predefined_service_charge_id = selectedService.id;
        updatedCharges[index].service_type = selectedService.name;
        return updatedCharges;
      });
    }
  }, [predefinedServiceCharges]);

  const handleValueChange = useCallback((value: string, index: number, flatType: string) => {
    const numValue = parseFloat(value) || 0;
    
    setCharges(prevCharges => {
      const updatedCharges = [...prevCharges];
      const amountIndex = updatedCharges[index].amounts.findIndex(amt => amt.flat_type === flatType);
      
      if (amountIndex >= 0) {
        updatedCharges[index].amounts[amountIndex].amount = numValue;
      } else {
        updatedCharges[index].amounts.push({ flat_type: flatType, amount: numValue });
      }
      
      return updatedCharges;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    console.log("13 13 13")
    // Validate that all charges have valid service type
    const isValid = charges.every(charge => charge.predefined_service_charge_id > 0);
    
    if (!isValid) {
      toast.error("Please select all service types");
      return;
    }
    
    // Ensure all charges have 3 amounts (one for each flat type)
    const validatedCharges = charges.map(charge => {
      const flatTypes = ["TWO_BHK", "THREE_BHK", "FOUR_BHK"];
      
      // Ensure all flat types exist in the amounts array
      flatTypes.forEach(flatType => {
        if (!charge.amounts.some(amt => amt.flat_type === flatType)) {
          charge.amounts.push({ flat_type: flatType, amount: 0 });
        }
      });
      
      return charge;
    });
    
    onSubmit(validatedCharges);
  }, [charges, onSubmit]);

  // Filter out already selected service types for new selections
  const getAvailableServiceTypes = useCallback((currentIndex: number) => {
    const selectedIds = charges.map((charge, index) => 
      index !== currentIndex ? charge.predefined_service_charge_id : 0
    ).filter(id => id > 0);
    
    return predefinedServiceCharges.filter(service => 
      !selectedIds.includes(service.id) || charges[currentIndex].predefined_service_charge_id === service.id
    );
  }, [charges, predefinedServiceCharges]);

  // Get amount for a specific flat type in a charge
  const getAmountForFlatType = useCallback((charge: ServiceCharge, flatType: string) => {
    const amount = charge.amounts.find(a => a.flat_type === flatType);
    return amount ? amount.amount : 0;
  }, []);

  // Define columns for responsive table
  const columns = [
    {
      key: 'service',
      title: 'Service Type',
      render: (_: any, record: any) => (
        <Select
          value={record.predefined_service_charge_id.toString()}
          onValueChange={(value) => handleServiceTypeChange(value, record.index)}
        >
          <SelectTrigger className="border-primary-200 focus:border-primary w-full">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableServiceTypes(record.index).map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    {
      key: 'twoBHKCharge',
      title: '2 BHK (₹)',
      render: (value: any, record: any) => (
        <Input
          type="number"
          placeholder="Amount"
          value={getAmountForFlatType(record, "TWO_BHK").toString()}
          onChange={(e) => handleValueChange(e.target.value, record.index, "TWO_BHK")}
          className="text-center border-primary-200 focus:border-primary"
        />
      )
    },
    {
      key: 'threeBHKCharge',
      title: '3 BHK (₹)',
      render: (value: any, record: any) => (
        <Input
          type="number"
          placeholder="Amount"
          value={getAmountForFlatType(record, "THREE_BHK").toString()}
          onChange={(e) => handleValueChange(e.target.value, record.index, "THREE_BHK")}
          className="text-center border-primary-200 focus:border-primary"
        />
      )
    },
    {
      key: 'fourBHKCharge',
      title: '4 BHK (₹)',
      render: (value: any, record: any) => (
        <Input
          type="number"
          placeholder="Amount"
          value={getAmountForFlatType(record, "FOUR_BHK").toString()}
          onChange={(e) => handleValueChange(e.target.value, record.index, "FOUR_BHK")}
          className="text-center border-primary-200 focus:border-primary"
        />
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_: any, record: any) => (
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={() => handleRemoveCharge(record.index)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      )
    }
  ];

  // Prepare data for responsive table
  const tableData = charges.map((charge, index) => ({
    ...charge,
    index
  }));

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-white/80 backdrop-blur-md border-primary/10 animate-scale-in overflow-hidden rounded-xl">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-primary-700">Service Charges</h2>
          <p className="text-gray-600">Set the charges for each flat type</p>
        </div>
        
        <div className="overflow-x-auto">
          <ResponsiveTable
            data={tableData}
            columns={columns}
            className="w-full"
          />
          
          <div className="mt-4 p-4 bg-primary-50/80 backdrop-blur-sm rounded-lg border border-primary-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="text-lg font-medium text-primary-800">Total</div>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-md border border-primary-100 shadow-sm">
                  <div className="text-sm text-primary-600">2 BHK</div>
                  <div className="font-semibold text-primary-900">₹{totals.twoBHK}</div>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-md border border-primary-100 shadow-sm">
                  <div className="text-sm text-primary-600">3 BHK</div>
                  <div className="font-semibold text-primary-900">₹{totals.threeBHK}</div>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-md border border-primary-100 shadow-sm">
                  <div className="text-sm text-primary-600">4 BHK</div>
                  <div className="font-semibold text-primary-900">₹{totals.fourBHK}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddCharge}
            className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Service Charge
          </Button>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Save Changes
            </Button>
            
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceChargeForm;
