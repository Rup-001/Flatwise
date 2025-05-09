
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg border-gray-200 backdrop-blur-sm bg-white/90 animate-fade-in">
        <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-gray-700">
            <XCircle className="h-6 w-6 text-gray-500" />
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Payment Cancelled
            </h2>
            <p className="text-gray-600 mb-4">
              You have cancelled the payment process.
            </p>
            <p className="text-gray-500 text-sm">
              Your registration has not been completed and you have not been charged.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50/50 border-t border-gray-200 p-4 flex justify-center space-x-3">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-gray-700 hover:bg-gray-800 shadow-md"
          >
            Resume Registration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
