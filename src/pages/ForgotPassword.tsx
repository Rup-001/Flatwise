// import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Mail, KeyRound } from 'lucide-react';
// // import { Mail, KeyRound, LockReset } from 'lucide-react';
// import Navbar from '@/components/Navbar';

// const emailSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
// });

// const codeSchema = z.object({
//   code: z.string().min(4, "Code must be at least 4 characters"),
// });

// const resetSchema = z.object({
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string()
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// const ForgotPassword = () => {
//   const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
//   const [email, setEmail] = useState('');
//   const [code, setCode] = useState('');

//   const emailForm = useForm<z.infer<typeof emailSchema>>({
//     resolver: zodResolver(emailSchema),
//     defaultValues: { email: '' }
//   });

//   const codeForm = useForm<z.infer<typeof codeSchema>>({
//     resolver: zodResolver(codeSchema),
//     defaultValues: { code: '' }
//   });

//   const resetForm = useForm<z.infer<typeof resetSchema>>({
//     resolver: zodResolver(resetSchema),
//     defaultValues: { password: '', confirmPassword: '' }
//   });

//   const handleEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
//     setEmail(data.email);
//     // Simulate sending code
//     // await api.sendCode(data.email);
//     setStep('code');
//   };

//   const handleCodeSubmit = async (data: z.infer<typeof codeSchema>) => {
//     setCode(data.code);
//     // Simulate code validation
//     // await api.validateCode(email, data.code);
//     setStep('reset');
//   };

//   const handleResetSubmit = async (data: z.infer<typeof resetSchema>) => {
//     // Simulate password reset
//     // await api.resetPassword({ email, code, newPassword: data.password });
//     alert("Password reset successful!");
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-secondary/30">
//       <Navbar />
//       <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
//         <div className="w-full max-w-md animate-scale-in">
//           <Card className="shadow-soft border-muted/30">
//             <CardHeader className="space-y-1">
//               <div className="flex justify-center mb-2">
//                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
//                   <div className="h-6 w-6 text-primary" />
//                   {/* <LockReset className="h-6 w-6 text-primary" /> */}
//                 </div>
//               </div>
//               <CardTitle className="text-2xl font-semibold text-center">
//                 {step === 'email' && 'Forgot Password'}
//                 {step === 'code' && 'Enter Verification Code'}
//                 {step === 'reset' && 'Reset Password'}
//               </CardTitle>
//               <CardDescription className="text-center">
//                 {step === 'email' && 'Enter your email to receive a reset code.'}
//                 {step === 'code' && `We sent a code to ${email}.`}
//                 {step === 'reset' && 'Set your new password.'}
//               </CardDescription>
//             </CardHeader>

//             <CardContent className="space-y-4">
//               {step === 'email' && (
//                 <Form {...emailForm}>
//                   <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
//                     <FormField
//                       control={emailForm.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input placeholder="email@example.com" type="email" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full">
//                       <Mail className="h-4 w-4 mr-2" />
//                       Send Code
//                     </Button>
//                   </form>
//                 </Form>
//               )}

//               {step === 'code' && (
//                 <Form {...codeForm}>
//                   <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
//                     <FormField
//                       control={codeForm.control}
//                       name="code"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Verification Code</FormLabel>
//                           <FormControl>
//                             <Input placeholder="123456" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full">
//                       <KeyRound className="h-4 w-4 mr-2" />
//                       Verify Code
//                     </Button>
//                   </form>
//                 </Form>
//               )}

//               {step === 'reset' && (
//                 <Form {...resetForm}>
//                   <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
//                     <FormField
//                       control={resetForm.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>New Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={resetForm.control}
//                       name="confirmPassword"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Confirm Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full">
//                       <div className="h-4 w-4 mr-2" />
//                       {/* <LockReset className="h-4 w-4 mr-2" /> */}
//                       Reset Password
//                     </Button>
//                   </form>
//                 </Form>
//               )}
//             </CardContent>

//             <CardFooter className="flex justify-center">
//               <div className="text-sm text-muted-foreground">
//                 Back to{' '}
//                 <a href="/login" className="text-primary hover:underline font-medium">
//                   Login
//                 </a>
//               </div>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/use-auth';

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const codeSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be 6 characters"),
});

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type Step = 'email' | 'code' | 'reset';

const ForgotPassword = () => {
  const { sendResetCode, verifyResetCode, resetPassword, isLoading } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    const success = await sendResetCode(data.email);
    if (success) {
      setEmail(data.email);
      setStep('code');
    }
  };

  const onCodeSubmit = async (data: z.infer<typeof codeSchema>) => {
    const success = await verifyResetCode(email, data.code);
    if (success) {
      setStep('reset');
    }
  };

  const onResetSubmit = async (data: z.infer<typeof resetSchema>) => {
    const success = await resetPassword(email, data.password);
    if (success) {
      // Redirect to login or show success message
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-scale-in">
          <Card className="shadow-soft border-muted/30">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold text-center">
                {step === 'email' && 'Reset Your Password'}
                {step === 'code' && 'Verify Code'}
                {step === 'reset' && 'Set New Password'}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 'email' && 'Enter your email to receive a reset code'}
                {step === 'code' && 'Enter the code sent to your email'}
                {step === 'reset' && 'Enter your new password'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'email' && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@example.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full btn-hover-grow" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Sending</span>
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Send Reset Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'code' && (
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit code"
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full btn-hover-grow" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Verifying</span>
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Verify Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'reset' && (
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full btn-hover-grow" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Resetting</span>
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;