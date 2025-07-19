
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';
import { LogOut, CreditCard, ArrowRight } from 'lucide-react';

interface RegistrationFee {
  amount: number;
  currency: string;
}

const PaymentDue: React.FC = () => {
  const { auth, society, logout } = useAppContext();
  const navigate = useNavigate();
  const [registrationFee, setRegistrationFee] = useState<RegistrationFee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Check if the user is an admin or owner
  const isAdminOrOwner = auth.user?.role === 'admin' || auth.user?.role === 'owner';

  // Fetch registration fee amount
  useEffect(() => {
    const fetchRegistrationFee = async () => {
      if (!isAdminOrOwner) return;
      
      setIsLoading(true);
      try {
        const response = await apiRequest<RegistrationFee>(
          `${ENDPOINTS.SOCIETIES}/registration-fee`, 
          'GET'
        );
        setRegistrationFee(response);
      } catch (error) {
        toast.error('Failed to fetch registration fee');
        console.error('Error fetching registration fee:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationFee();
  }, [isAdminOrOwner]);

  // Handle payment
  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await apiRequest<{url: string}>(
        `${ENDPOINTS.PAYMENTS}/create-subscription-checkout`, 
        'POST'
      );
      
      if (response.url) {
        // Redirect to payment page
        window.location.href = response.url;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-scale-in">
          <Card className="shadow-xl border-red-200 overflow-hidden">
            <div className="absolute right-0 top-0 h-16 w-16">
              <div className="absolute transform rotate-45 bg-red-600 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                Payment Due
              </div>
            </div>
            
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">
                Subscription Payment Required
              </CardTitle>
              <CardDescription className="text-center">
                Your society's subscription has expired. 
                {isAdminOrOwner 
                  ? " Please renew it to continue using all features."
                  : " Please contact your society administrator."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-red-800 text-sm">
                  <strong>Access Restricted:</strong> You cannot access the society management features until the subscription is renewed.
                </p>
              </div>
              
              {isAdminOrOwner && registrationFee && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-amber-800 mb-1">
                    <strong>Registration Fee:</strong>
                  </p>
                  <p className="text-center text-3xl font-bold">
                    {registrationFee.currency === '৳ ' ? '৳ ' : registrationFee.currency} {registrationFee.amount.toFixed(2)}
                  </p>
                </div>
              )}
              
              {isAdminOrOwner && (
                <div className="mt-4">
                  <Link to="/subscription" className="w-full">
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      View Subscription Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              {isAdminOrOwner && (
                <Button 
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={paymentLoading || isLoading || !registrationFee}
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2">Processing</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <>Pay Now</>
                  )}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentDue;
