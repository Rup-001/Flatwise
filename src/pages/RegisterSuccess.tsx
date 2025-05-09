import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader, Home, AlertCircle } from 'lucide-react';
import { completeRegistration } from '@/lib/api';
import { toast } from 'sonner';
import { useRegistration } from '@/context/RegistrationContext';

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state: registrationData } = useRegistration();
  
  useEffect(() => {
    const processRegistration = async () => {
      try {
        if (!registrationData.owner || !registrationData.building) {
          setError('Registration data not found. Please complete the registration process first.');
          setIsProcessing(false);
          toast.error('Registration data not found');
          return;
        }
        
        console.log("Using registration data:", registrationData);
        
        await completeRegistration(registrationData);
        toast.success('Registration completed successfully!');
        
        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (error: any) {
        console.error('Error completing registration:', error);
        setError(error.message || 'Failed to complete registration');
        toast.error(error.message || 'Failed to complete registration');
      } finally {
        setIsProcessing(false);
      }
    };
    
    processRegistration();
  }, [navigate, registrationData]);
  
  const handleTryAgain = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await completeRegistration(registrationData);
      toast.success('Registration completed successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error: any) {
      console.error('Error completing registration:', error);
      setError(error.message || 'Failed to complete registration');
      toast.error(error.message || 'Failed to complete registration');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error && error.includes('Registration data not found')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Registration Incomplete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-center text-muted-foreground">
                {error}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/register">
              <Button>Start Registration</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Registration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Setting up your account...
              </p>
            </div>
          ) : registrationComplete ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Registration Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Your account has been successfully created. You will be redirected to login in a few seconds.
              </p>
              
              {registrationData && (
                <div className="bg-secondary/30 p-4 rounded-lg text-left mb-4">
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <p className="text-sm">Building: {registrationData.building?.name}</p>
                  <p className="text-sm">Email: {registrationData.owner?.email}</p>
                  <p className="text-sm">Total Flats: {registrationData.building?.totalFlats}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-xl font-semibold mb-2">Registration Failed</h3>
              <p className="text-muted-foreground mb-6">
                We encountered an issue while completing your registration: {error}
              </p>
              <Button onClick={handleTryAgain} disabled={isProcessing} className="mb-4">
                {isProcessing ? 'Processing...' : 'Try Again'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {registrationComplete ? (
            <Link to="/login">
              <Button>Login Now</Button>
            </Link>
          ) : (
            <div className="flex space-x-4">
              <Link to="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterSuccess;
