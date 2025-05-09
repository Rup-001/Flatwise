
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

const RegisterFailed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-pink-100 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-700">Registration Failed</CardTitle>
          <CardDescription className="text-red-600">
            We couldn't complete your society registration
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Unfortunately, there was an issue processing your registration payment. Your payment was not successful.
          </p>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
            <h3 className="font-medium text-red-800 mb-2">What Happened?</h3>
            <p className="text-sm text-red-700">
              The payment was declined or an error occurred during processing. No charges have been made to your account.
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

export default RegisterFailed;
