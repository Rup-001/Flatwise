import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building, 
  Mail,
  Home, 
  CreditCard, 
  Plus, 
  Minus,
  ChevronRight,
  CheckCircle,
  Users,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRegistration } from '@/hooks/use-registration';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StepIndicator from '@/components/StepIndicator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  registerUser, 
  createSociety, 
  inviteUsersBulk, 
  createFlatsBulk, 
  calculatePrice,
  applyPromoCode,
  initiatePayment,
  initiateRegistrationPayment 
} from '@/lib/api';
import ErrorLogger from '@/lib/errorLogger';
import { Checkbox } from '@/components/ui/checkbox';

const ownerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const buildingSchema = z.object({
  buildingName: z.string().min(2, 'Building name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(5, 'Valid postcode is required'),
  totalFlats: z.coerce.number().min(1, 'At least 1 flat is required'),
});

const paymentSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;
type BuildingFormValues = z.infer<typeof buildingSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentResponse {
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

interface RegisterFormData {
  owner: OwnerFormValues;
  building: BuildingFormValues;
  payment: PaymentFormValues;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<PaymentResponse | null>(null);
  const { state: registrationState, setOwnerData, setBuildingData, setFlatsData } = useRegistration();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    owner: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    building: {} as BuildingFormValues,
    payment: {} as PaymentFormValues,
  });
  
  const steps = [
    {
      icon: <Building className="h-5 w-5" />,
      label: "Building Info",
      active: currentStep === 0,
      completed: currentStep > 0
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Owner Info",
      active: currentStep === 1,
      completed: currentStep > 1
    },
    
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Payment",
      active: currentStep === 2,
      completed: currentStep > 2
    }
  ];
  
  useEffect(() => {
    import('@/lib/errorLogger').then(({ setupGlobalErrorHandler }) => {
      setupGlobalErrorHandler();
    });
  }, []);
  
  const handleOwnerSubmit = async (data: OwnerFormValues) => {
    const ownerData: OwnerFormValues = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword
    };
    
    setFormData(prev => ({ ...prev, owner: ownerData }));
    setOwnerData(ownerData);
    setCurrentStep(2);
  };

  const handleBuildingSubmit = async (data: BuildingFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await calculatePrice({
        name: data.buildingName,
        address: data.address,
        city: data.city,
        state: data.city + " Division",
        country: "Bangladesh",
        postal_code: data.postcode,
        location_lat: 23.8,
        location_lng: 90.4,
        flats: Array(data.totalFlats).fill(0).map((_, i) => ({
          number: `Flat ${i + 1}`,
          flat_type: 'TWO_BHK'
        })),
        user_emails: [formData.owner.email]
      });
      
      setPricingInfo(response);
      setFormData(prev => ({ 
        ...prev, 
        building: data
      }));
      
      setBuildingData({
        name: data.buildingName,
        address: data.address,
        city: data.city,
        state: data.city + " Division",
        country: "Bangladesh",
        postal_code: data.postcode,
        totalFlats: data.totalFlats
      });
      
      setFlatsData(Array(data.totalFlats).fill(0).map((_, i) => ({
        number: `Flat ${i + 1}`,
        flat_type: "TWO_BHK"
      })));
      
      setCurrentStep(1);
    } catch (error) {
      toast.error('Failed to calculate price. Please try again.');
      console.error("Price calculation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    setIsLoading(true);
    try {
      if (!pricingInfo) {
        toast.error('Price information is missing');
        return;
      }

      const paymentResponse = await initiateRegistrationPayment({
        email: formData.owner.email,
        amount: pricingInfo.total_price,
        building_info: {
          name: formData.building.buildingName,
          address: formData.building.address,
          city: formData.building.city,
          country: "Bangladesh",
          postal_code: formData.building.postcode,
          flats: Array(formData.building.totalFlats).fill(0).map((_, i) => ({
            number: `Flat ${i + 1}`,
            flat_type: "TWO_BHK"
          })),
          user_emails: [formData.owner.email]
        }
      });

      if (paymentResponse.payment_url) {
        window.location.href = paymentResponse.payment_url;
      } else {
        toast.error('Payment URL not received');
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error('Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-purple-50 to-indigo-100 gap-8">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">Register Your Building</h1>
        <p className="text-purple-600 text-center mb-8">
          Create an account to manage your building's service charges
        </p>
        
        <StepIndicator steps={steps} />
        
        <div className="my-8">
          {currentStep === 0 && (
            <BuildingFormComponent onSubmit={handleBuildingSubmit} initialData={formData.building} />
          )}
          {currentStep === 1 && (
            
            <OwnerFormComponent onSubmit={handleOwnerSubmit} initialData={formData.owner} />
          )}
          {currentStep === 2 && (
            <PaymentFormComponent 
              onSubmit={handlePaymentSubmit} 
              initialData={formData.payment} 
              pricingInfo={pricingInfo}
              ownerEmail={formData.owner.email}
              buildingData={formData.building}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface OwnerFormProps {
  onSubmit: (data: OwnerFormValues) => void;
  initialData: OwnerFormValues;
}

const OwnerFormComponent: React.FC<OwnerFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Information</CardTitle>
        <CardDescription>Enter your details to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                    <Input placeholder="+8801XXXXXXXXX" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

interface BuildingFormProps {
  onSubmit: (data: BuildingFormValues) => void;
  initialData: BuildingFormValues;
}

const BuildingFormComponent: React.FC<BuildingFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: initialData || {
      buildingName: '',
      address: '',
      city: '',
      postcode: '',
      totalFlats: 1,
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Information</CardTitle>
        <CardDescription>Enter your building details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="buildingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sunset Apartments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="1205" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalFlats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Flats</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      {...field} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(!isNaN(value) ? value : 1);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

interface PaymentFormProps {
  
  onSubmit: (data: PaymentFormValues) => void;
  initialData: PaymentFormValues;
  pricingInfo: PaymentResponse | null;
  ownerEmail: string;
  buildingData: BuildingFormValues;
}

const PaymentFormComponent: React.FC<PaymentFormProps> = ({ 
  
  onSubmit, 
  initialData, 
  pricingInfo,
  ownerEmail,
  buildingData
}) => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      acceptTerms: false,
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    discount: number;
    discounted_amount: number;
  } | null>(null);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim() || !pricingInfo?.total_price) return;

    setPromoLoading(true);
    try {
      const response = await applyPromoCode({
        promo_code: promoCode,
        original_amount: pricingInfo.total_price,
        user_email: ownerEmail,
        location_lat: 23.8,
        location_lng: 90.4,
        flats: Array(buildingData.totalFlats).fill(0).map((_, i) => ({
          number: `Flat ${i + 1}`,
          flat_type: "TWO_BHK"
        }))
      });

      setDiscountInfo({
        discount: response.discount,
        discounted_amount: response.discounted_amount
      });
      toast.success('Promo code applied successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>Review and complete your registration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/30 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>₹{pricingInfo?.base_price || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{pricingInfo?.tax || 0}</span>
            </div>
            {discountInfo && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{discountInfo.discount}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 border-border/50 flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{discountInfo ? discountInfo.discounted_amount : (pricingInfo?.total_price || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="uppercase"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyPromoCode}
            disabled={promoLoading || !promoCode.trim()}
          >
            {promoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the <a href="#" className="text-primary underline">terms and conditions</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full mt-6">
              Complete Registration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Register;
