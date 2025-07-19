
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Home, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useBills } from '@/hooks/use-bills';
import { useAppContext } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';

const RenterDashboard = () => {
  const { auth } = useAppContext();
  const { userBills, isLoading } = useBills();
  
  const recentPayments = userBills
    ?.filter(bill => bill.status === 'PAID')
    .sort((a, b) => new Date(b.bill_month).getTime() - new Date(a.bill_month).getTime())
    .slice(0, 3);

  const pendingBills = userBills
    ?.filter(bill => bill.status === 'PENDING')
    .sort((a, b) => new Date(a.bill_month).getTime() - new Date(b.bill_month).getTime());

  const pendingBill = pendingBills && pendingBills.length > 0 ? pendingBills[0] : undefined;
  
  const handlePayNow = () => {
    // Navigate to bills page or implement payment logic
    console.log('Pay Now clicked');
  };

  // Check for flat_id safely considering the User type which may not have flat_id directly
  const flatId = auth.user?.id || 
                (auth.user as any)?.flat_id;
  
  const flatNumber = flatId ? `Flat ${flatId}` : 'Your Flat';
  const hasDues = pendingBill !== undefined;
  const dueAmount = pendingBill ? pendingBill.total_amount : 0;
  const dueDate = pendingBill ? format(parseISO(pendingBill.bill_month), 'MMM dd, yyyy') : '';

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight animate-fade-in text-left">
            Welcome, {auth.user?.name || auth.user?.fullname}
          </h1>
          <p className="text-muted-foreground max-w-xl animate-fade-in text-left">
            Here's an overview of your flat and payment status.
          </p>
          
          <div className="flex flex-wrap gap-3 animate-fade-in">
            <Link to="/my-bills">
              <Button variant="default" className="gap-2 btn-hover-grow">
                <FileText className="h-4 w-4" />
                View Bills
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="gap-2 btn-hover-grow">
                <User className="h-4 w-4" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xs p-4 rounded-lg border border-border/40 shadow-soft animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-left">{flatNumber}</h3>
              <p className="text-xs text-muted-foreground text-left">Green Valley Heights</p>
            </div>
          </div>
          
          {hasDues ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-red-700">Payment Due</h4>
                  <p className="text-sm text-red-600">৳ {dueAmount} due by {dueDate}</p>
                  <Link to="/my-bills">
                    <Button variant="destructive" size="sm" className="mt-2">
                      Pay Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-green-700">All Payments Complete</h4>
                  <p className="text-sm text-green-600">You have no pending dues</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-left">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBills && pendingBills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-amber-800 text-left">Pending Payments</h3>
                  {pendingBills.map((bill, index) => (
                    <div key={`pending-${bill.id}`} className="flex items-center justify-between p-3 mb-2 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="text-left">
                        <h4 className="font-medium">{format(parseISO(bill.bill_month), 'MMMM yyyy')}</h4>
                        <p className="text-sm text-muted-foreground">
                          Amount: ৳ {bill.total_amount}
                        </p>
                      </div>
                      <Link to="/my-bills">
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-100">
                          Pay Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-sm font-medium mb-2 text-left">Recent Payments</h3>
              {recentPayments && recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-left">
                      <h4 className="font-medium">{format(parseISO(payment.bill_month), 'MMMM yyyy')}</h4>
                      <p className="text-sm text-muted-foreground">
                        Paid: ৳ {payment.total_amount}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {payment.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-left">No payment history available.</p>
              )}
              
              <Link to="/my-bills" className="block text-center">
                <Button variant="ghost" size="sm">
                  View All Bills
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RenterDashboard;
