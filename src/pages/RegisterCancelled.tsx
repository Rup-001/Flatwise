
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const RegisterCancelled = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-gray-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Registration Cancelled</CardTitle>
          <CardDescription>
            Your society registration process was cancelled
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            You've cancelled the registration payment process. No charges have been made to your account.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">What's Next?</h3>
            <p className="text-sm text-gray-700">
              You can restart the registration process anytime when you're ready to complete setting up your society.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link to="/register" className="w-full">
            <Button className="w-full flex items-center justify-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterCancelled;
