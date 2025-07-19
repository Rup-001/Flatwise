
import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  CreditCard, 
  ArrowRight, 
  UserCog,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import RenterDashboard from '@/components/dashboard/RenterDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppContext } from '@/context/AppContext';
import { useBills } from '@/hooks/use-bills';
import { format, parseISO } from 'date-fns';
import { apiRequest, ENDPOINTS, USER_ROLES } from '@/lib/api';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { auth, society } = useAppContext();
  const navigate = useNavigate();
  const { userBills } = useBills();
  const [societyFlats, setSocietyFlats] = useState<any[]>([]);
  const [serviceCharges, setServiceCharges] = useState<any>({ service_charges: [] });
  const [isLoading, setIsLoading] = useState(false);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const roleId = auth.user?.role_id || 0;
  const isOwner = roleId === USER_ROLES.ADMIN || roleId === USER_ROLES.OWNER;
  const userRole = isOwner ? 'owner' : 'renter';
  
  const ownerPaysServiceCharge = isOwner && auth.user?.pay_service_charge === true;

  const pendingBills = userBills?.filter(bill => bill.status === 'PENDING') || [];
  const hasPendingBills = pendingBills.length > 0;
  const recentPayments = userBills
    ?.filter(bill => bill.status === 'PAID')
    .sort((a, b) => new Date(b.bill_month).getTime() - new Date(a.bill_month).getTime())
    .slice(0, 2);

  useEffect(() => {
    if (auth.isAuthenticated && isOwner && society.current?.id) {
      fetchSocietyData();
    }
  }, [auth.isAuthenticated, isOwner, society.current?.id]);

  const fetchSocietyData = async () => {
    if (!society.current?.id) return;
    
    setIsLoading(true);
    try {
      const flatsResponse = await apiRequest<any[]>(
        `${ENDPOINTS.FLATS}/society/${society.current.id}`,
        "GET"
      );
      setSocietyFlats(flatsResponse || []);
      
      const chargesResponse = await apiRequest<any>(
        `${ENDPOINTS.SERVICE_CHARGES}/society/${society.current.id}`,
        "GET"
      );
      setServiceCharges(chargesResponse || { service_charges: [] });
      
    } catch (error) {
      console.error("Error fetching society data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className={`flex-1 container mx-auto px-4 sm:px-6 py-8 ${isMobile ? 'pt-20' : 'pt-24'}`}>
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-bold">
            Welcome, {auth.user?.fullname || auth.user?.name || 'User'}
          </h1>
        </div>
        
        {isOwner ? (
          <>
            <OwnerDashboard />
            {ownerPaysServiceCharge && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary-600 text-left">Your Payments</h2>
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center text-left">
                      <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      Your Payment Status
                    </CardTitle>
                    <CardDescription className="text-left">
                      Manage your service charge and maintenance payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasPendingBills ? (
                      <div className="space-y-4">
                        {pendingBills.map((bill) => (
                          <div key={bill.id} className="bg-amber-50 p-4 rounded-md border border-amber-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium flex items-center text-amber-800">
                                  <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                  Payment Due for {format(parseISO(bill.bill_month), 'MMMM yyyy')}
                                </h3>
                                <p className="text-sm text-amber-700 mt-1">Amount: ৳ {bill.total_amount}</p>
                              </div>
                              <Link to="/my-bills">
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                  Pay Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        <Link to="/my-bills" className="block w-full">
                          <Button variant="outline" className="w-full">
                            View All Bills
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-green-800">All Payments Complete</h3>
                            <p className="text-sm text-green-700 mt-1">You have no pending payments at this time.</p>
                            
                            {recentPayments && recentPayments.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-green-800 mb-2">Recent Payments</h4>
                                {recentPayments.map((payment) => (
                                  <div key={payment.id} className="flex justify-between text-sm text-green-700 py-1 border-t border-green-200">
                                    <span>{format(parseISO(payment.bill_month), 'MMMM yyyy')}</span>
                                    <span>৳ {payment.total_amount}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <Link to="/my-bills" className="mt-3 inline-block">
                              <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-100">
                                View Payment History
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <RenterDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
