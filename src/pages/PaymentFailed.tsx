
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract error details from URL params
  const errorMessage = searchParams.get('error_message') || 'An error occurred during payment processing';
  const transactionId = searchParams.get('transaction_id');
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-red-50 to-red-100">
      <Card className="w-full max-w-md shadow-lg border-red-100 backdrop-blur-sm bg-white/90 animate-fade-in">
        <CardHeader className="bg-red-50 border-b border-red-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-red-800">
            <XCircle className="h-6 w-6 text-red-600" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Payment Unsuccessful
            </h2>
            <p className="text-red-600 mb-4">
              {errorMessage}
            </p>
            <p className="text-gray-600 text-sm">
              Your payment could not be processed. You have not been charged.
            </p>
            
            {transactionId && (
              <p className="mt-4 text-sm text-gray-600">
                Reference: <span className="font-mono font-medium">{transactionId}</span>
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-red-50/50 border-t border-red-100 p-4 flex justify-center space-x-3">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-red-600 hover:bg-red-700 shadow-md"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentFailed;
