
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ServiceChargeForm from '@/components/ServiceChargeForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Users, PlusCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';




const ManageCharges = () => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { 
    serviceCharges, 
    fetchServiceCharges,
    updateServiceCharges,
    predefinedServiceCharges,
    fetchPredefinedCharges,
    auth,
    society
  } = useAppContext();
  
  useEffect(() => {
    // Check authentication
    if (auth.loading) return; // Wait for user to finish loading
    
    if (!auth.isAuthenticated) {
      toast.error("Please login to access this page");
      navigate('/login');
      return;
    }
    
    console.log("ManageCharges - Auth user:", auth.user);
    
    // Only fetch data once when component mounts
    // if (!isInitialized) {
    //   const loadData = async () => {
    //     try {
    //       await fetchPredefinedCharges().catch(error => {
    //         console.error("Error fetching predefined service charges:", error);
    //         toast.error("Failed to load predefined charges");
    //       });
          
    //       await fetchServiceCharges().catch(error => {
    //         console.error("Error fetching service charges:", error);
    //         // Don't show error toast here as this is expected when no charges exist
    //       });
          
    //       setIsInitialized(true);
    //     } catch (error) {
    //       console.error("Error in loadData:", error);
    //     }
    //   };
    if (!isInitialized && auth.user?.society_id) {
      const loadData = async () => {
        try {
          await fetchPredefinedCharges();
          await fetchServiceCharges();
          setIsInitialized(true);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };
      loadData();
    }
  }, [auth.isAuthenticated, navigate, fetchServiceCharges, fetchPredefinedCharges, isInitialized, auth.user]);
  
  const handleSubmit = async (data: any) => {
    try {
      setIsCreating(true);
      await updateServiceCharges(data);
      toast.success("Service charges updated successfully!");
      // navigate(0);
    } catch (error) {
      console.error("Error updating service charges:", error);
      toast.error("Failed to update service charges");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateDefaultCharges = async () => {
    setShowForm(true);
    // console.log("11111")
    // if (predefinedServiceCharges.items.length === 0) {
    //   toast.error("No predefined service charges available");
    //   return;
    // }
    
    // try {
    //   console.log("2222")
    //   setIsCreating(true);
    //   console.log("3333")
      
    //   const defaultCharges = predefinedServiceCharges.items.slice(0, 1).map(preCharge => (
        
    //     {
        
    //     predefined_service_charge_id: preCharge.id,
    //     service_type: preCharge.name,
    //     amounts: [
    //       { flat_type: "TWO_BHK", amount: 0 },
    //       { flat_type: "THREE_BHK", amount: 0 },
    //       { flat_type: "FOUR_BHK", amount: 0 }
    //     ]
    //   })
      
    // );
    // console.log("4444")
    //   await updateServiceCharges(defaultCharges);
    //   console.log("5555")
    //   toast.success("Default service charges created successfully!");
    //   console.log("6666")
    //   // Refetch service charges to update the UI
    //   await fetchServiceCharges();
    //   console.log("7777")
    //   // Navigate to dashboard after a slight delay
    //   //setTimeout(() => navigate(0), 1000);
    // } catch (error) {
    //   console.error("Error creating default service charges:", error);
    //   toast.error("Failed to create service charges");
    // } finally {
    //   setIsCreating(false);
    // }
  };

  const noChargesYet = !serviceCharges.loading && (!serviceCharges.items || serviceCharges.items.length === 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto mb-6 animate-fade-in">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                Manage Service Charges
              </h1>
              <p className="text-primary-600 max-w-2xl">
                Set up service charges for different flat types. These charges will be used to calculate the monthly maintenance fees for each flat.
              </p>
              {society.current && (
                <div className="mt-2 text-sm text-primary-500">
                  <span className="font-medium">Building:</span> {society.current.name}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {serviceCharges.loading || predefinedServiceCharges.loading  || predefinedServiceCharges.loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent font-semibold">
              Loading service charges...
              
            </div>
          </div>
        ) 
        : serviceCharges.error ? (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-red-50/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-red-100">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-red-700 mb-4">Error Loading Service Charges</h2>
              <p className="text-gray-700 mb-6">
                {serviceCharges.error}
              </p>
              <Button 
                onClick={() => fetchServiceCharges()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )
         : noChargesYet && !showForm ? (
          
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-primary/10">
              <h2 className="text-2xl font-semibold text-primary-700 mb-4">No Service Charges Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't added any service charges for your building yet. 
                Let's start by creating some charges to calculate maintenance fees.
              </p>
              <Button 
                onClick={handleCreateDefaultCharges}
                className="bg-primary-600 hover:bg-primary-700 text-white"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Service Charges
                  </>
                )}
              </Button>
            </div>
          </div>
        ) 
        : (
          <ServiceChargeForm 
            onSubmit={handleSubmit} 
            initialData={serviceCharges.items}
            predefinedServiceCharges={predefinedServiceCharges.items}
          />
        )}
      </main>
    </div>
  );
};

export default ManageCharges;
