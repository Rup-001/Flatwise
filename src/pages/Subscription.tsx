
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import { CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest, ENDPOINTS, API_BASE_URL } from '@/lib/api';


interface PriceCalculation {
  base_price: number;
  tax: number;
  total_price: number;
  flat_counts: {
    TWO_BHK: number;
    THREE_BHK: number;
    FOUR_BHK: number;
  };
  user_count: number;
  location_multiplier: number;
}

const Subscription = () => {
  const { auth, society } = useAppContext();
  const [priceDetails, setPriceDetails] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const calculatePrice = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest<PriceCalculation>(
          `${API_BASE_URL}/pricing/calculate-price`,
          'POST',
          {}
        );
        setPriceDetails(response);
      } catch (error: any) {
        console.error("Price calculation error:", error);
        toast.error(error.message || 'Failed to calculate price');
      } finally {
        setIsLoading(false);
      }
    };

    calculatePrice();
  }, []);

  const handlePayment = async () => {
    try {
      const response = await apiRequest<{ payment_url: string }>(
        `${ENDPOINTS.PAYMENTS}/subscription/initiate`,
        'POST',
        {
          society_id: society.current?.id
        }
      );
      
      if (response && response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        toast.error('No payment URL received from the server');
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Society Subscription</h1>
          <p className="text-gray-600">Manage your society's subscription status</p>
        </div>

        <div className="grid gap-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Your society's current subscription information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {society.status === 'PAYMENT_DUE' ? (
                <div className="space-y-6">
                  <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                      <div className="space-y-2">
                        <h3 className="font-medium text-amber-800">Subscription Payment Required</h3>
                        <p className="text-sm text-amber-700">
                          Your society's subscription payment is due. To continue using all features, please complete the payment.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {priceDetails && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-4">Subscription Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Base Price</span>
                          <span className="font-medium">৳ {priceDetails.base_price}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">৳ {priceDetails.tax}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="font-semibold">Total Price</span>
                          <span className="font-semibold text-lg">৳ {priceDetails.total_price}</span>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="font-medium mb-2">Society Information</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Total Users: {priceDetails.user_count}</div>
                            <div>Flat Distribution:</div>
                            <ul className="list-disc list-inside pl-2">
                              <li>2 BHK: {priceDetails.flat_counts.TWO_BHK}</li>
                              <li>3 BHK: {priceDetails.flat_counts.THREE_BHK}</li>
                              <li>4 BHK: {priceDetails.flat_counts.FOUR_BHK}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handlePayment}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Calculating...' : 'Pay Subscription Fee'}
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-medium text-green-800">Subscription Active</h3>
                      <p className="text-sm text-green-700">
                        Your society's subscription is currently active and all features are available.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
