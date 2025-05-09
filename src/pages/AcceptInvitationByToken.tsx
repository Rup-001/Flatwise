import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { Loader2, Building, CheckCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  alias: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type FormValues = z.infer<typeof formSchema>;

const AcceptInvitationByToken = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      alias: '',
      phone: ''
    }
  });
  
  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link. The token is missing. Please check your email for the correct link.");
    }
  }, [token]);
  
  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setError("Invalid invitation link. The token is missing.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(
        `${ENDPOINTS.USERS}/token/${token}/accept`,
        "POST",
        {
          token,
          username: data.username,
          password: data.password,
          alias: data.alias || data.username,
          phone: data.phone,
          service_type: "RESIDENT"
        }
      );
      
      console.log("Acceptance response:", response);
      setIsSuccessful(true);
      toast.success("Account activation successful! You can now log in.");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setError(error.message || "Failed to accept invitation. Please try again.");
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Accept Invitation</CardTitle>
          <CardDescription className="text-center">
            Complete your account setup to join the building management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}
          
          {isSuccessful ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Account Activated!</h2>
              <p className="text-green-600 mb-6">
                Your account has been successfully activated. You can now log in to access your dashboard.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="john_doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+8801234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating Account...
                    </div>
                  ) : (
                    "Activate Account"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        
        {!isSuccessful && (
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AcceptInvitationByToken;
