
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Home } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show success message when component mounts
    toast.success('Payment completed successfully!');
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-green-200 backdrop-blur-sm bg-white/90 animate-fade-in">
        <CardHeader className="bg-green-50 border-b border-green-200 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-green-700">
            <Check className="h-6 w-6 text-green-600" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
              Payment Successful!
            </h2>
            <p className="text-green-600 mb-4">
              Your payment has been processed successfully
            </p>
            <p className="text-gray-600 text-sm">
              Thank you for your payment. The transaction has been completed, and a receipt has been emailed to you.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-green-50/50 border-t border-green-200 p-4 flex justify-center">
          <Button 
            onClick={() => navigate('/')} 
            className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
