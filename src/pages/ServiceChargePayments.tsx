import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { Check, CreditCard, Download, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useFlats } from '@/hooks/use-flats';
import Navbar from '@/components/Navbar';

interface ServiceChargePayment {
  id: number;
  user_id: number;
  flat_id: number;
  bill_id: number;
  society_id: number;
  amount: string;
  status: string;
  payment_month: string;
  payment_date: string;
  tran_id: string;
  transaction_details: any;
  currency: string;
  payment_method: string;
}

const ServiceChargePayments = () => {
  const [payments, setPayments] = useState<ServiceChargePayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ServiceChargePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const { auth } = useAppContext();
  const { societyFlats } = useFlats();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!auth.isAuthenticated) {
      toast.error("Please log in to access this page");
      navigate('/login');
      return;
    }
    
    fetchPayments();
  }, [auth.isAuthenticated]);
  
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const societyId = auth.user?.society_id;
      const userId = auth.user?.id;
      
      if (!societyId || !userId) {
        throw new Error("Missing society or user ID");
      }
      
      const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'owner';
      const endpoint = isAdmin 
        ? `${ENDPOINTS.PAYMENTS}/society/${societyId}`
        : `${ENDPOINTS.PAYMENTS}/society/${societyId}/user/${userId}`;
      
      const response = await apiRequest<ServiceChargePayment[]>(endpoint, "GET");
      
      setPayments(response);
      setFilteredPayments(response);
      console.log("Payments:", response);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error(error.message || "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMonthChange = (date: Date | null) => {
    setSelectedMonth(date);
    
    if (!date) {
      setFilteredPayments(payments);
      return;
    }
    
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_month);
      return (
        paymentDate.getMonth() === date.getMonth() &&
        paymentDate.getFullYear() === date.getFullYear()
      );
    });
    
    setFilteredPayments(filtered);
  };
  
  const handlePayment = async (payment: ServiceChargePayment) => {
    setPaymentProcessing(true);
    try {
      const response = await apiRequest<{payment_url: string}>(
        `${ENDPOINTS.PAYMENTS}/initiate/${payment.id}`,
        "POST"
      );
      
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setPaymentProcessing(false);
    }
  };
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Service Charge Payment History", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PP')}`, 20, 30);
      doc.text(`User: ${auth.user?.name || 'N/A'}`, 20, 38);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Payment Date", 20, 50);
      doc.text("Flat", 60, 50);
      doc.text("Month", 100, 50);
      doc.text("Amount", 140, 50);
      doc.text("Status", 170, 50);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 52, 190, 52);
      
      let y = 60;
      
      filteredPayments.forEach((payment, index) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("Payment Date", 20, y);
          doc.text("Flat", 60, y);
          doc.text("Month", 100, y);
          doc.text("Amount", 140, y);
          doc.text("Status", 170, y);
          
          doc.line(20, y + 2, 190, y + 2);
          y += 10;
        }
        
        if (payment.status === "SUCCESS" || payment.status === "COMPLETED") {
          doc.setTextColor(0, 128, 0);
        } else if (payment.status === "PENDING") {
          doc.setTextColor(255, 165, 0);
        } else {
          doc.setTextColor(255, 0, 0);
        }
        
        const flat = societyFlats.find(f => f.id === payment.flat_id);
        
        doc.setTextColor(0, 0, 0);
        doc.text(payment.payment_date ? format(new Date(payment.payment_date), 'PP') : "N/A", 20, y);
        doc.text(flat?.number || `${payment.flat_id}`, 60, y);
        doc.text(format(new Date(payment.payment_month), 'MMM yyyy'), 100, y);
        doc.text(`₹ ${payment.amount}`, 140, y);
        
        if (payment.status === "SUCCESS" || payment.status === "COMPLETED") {
          doc.setTextColor(0, 128, 0);
        } else if (payment.status === "PENDING") {
          doc.setTextColor(255, 165, 0);
        } else {
          doc.setTextColor(255, 0, 0);
        }
        doc.text(payment.status, 170, y);
        
        doc.setTextColor(0, 0, 0);
        
        if (index < filteredPayments.length - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.line(20, y + 2, 190, y + 2);
        }
        
        y += 10;
      });
      
      doc.save(`service-charge-payments-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  const exportToCSV = () => {
    try {
      let csvContent = "Payment Date,Flat,Month,Amount,Status,Transaction ID,Payment Method\n";
      
      filteredPayments.forEach(payment => {
        const flat = societyFlats.find(f => f.id === payment.flat_id);
        const row = [
          payment.payment_date ? format(new Date(payment.payment_date), 'PP') : "N/A",
          flat?.number || `${payment.flat_id}`,
          format(new Date(payment.payment_month), 'MMMM yyyy'),
          payment.amount,
          payment.status,
          payment.tran_id || "N/A",
          payment.payment_method || "N/A"
        ];
        
        csvContent += row.join(",") + "\n";
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `service-charge-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-6">Service Charge Payments</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              View and manage your monthly service charge payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchPayments} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleMonthChange(null)}
                  className={selectedMonth === null ? "bg-primary/10" : ""}
                >
                  All Months
                </Button>
                
                {[0, 1, 2].map(monthsAgo => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - monthsAgo);
                  
                  const isSelected = selectedMonth && 
                    selectedMonth.getMonth() === date.getMonth() && 
                    selectedMonth.getFullYear() === date.getFullYear();
                  
                  return (
                    <Button 
                      key={monthsAgo}
                      variant="outline"
                      onClick={() => handleMonthChange(new Date(date))}
                      className={isSelected ? "bg-primary/10" : ""}
                    >
                      {format(date, 'MMM yyyy')}
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={generatePDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payment records found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPayments.map(payment => {
                  const flat = societyFlats.find(f => f.id === payment.flat_id);
                  const isPending = payment.status === 'PENDING';
                  const isSuccess = payment.status === 'SUCCESS' || payment.status === 'COMPLETED';
                  
                  return (
                    <Card 
                      key={payment.id} 
                      className={`shadow-sm transition-shadow hover:shadow-md ${
                        isPending ? 'border-amber-200' : 
                        isSuccess ? 'border-green-200' : 'border-red-200'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{flat?.number || `Flat ${payment.flat_id}`}</CardTitle>
                            <CardDescription>
                              {format(new Date(payment.payment_month), 'MMMM yyyy')}
                            </CardDescription>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isSuccess ? 'bg-green-100 text-green-800' : 
                              isPending ? 'bg-amber-100 text-amber-800' : 
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold">₹ {payment.amount}</span>
                          </div>
                          
                          {payment.payment_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Paid On</span>
                              <span>{format(new Date(payment.payment_date), 'PP')}</span>
                            </div>
                          )}
                          
                          {payment.payment_method && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Method</span>
                              <span>{payment.payment_method}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3">
                        {isPending ? (
                          <Button 
                            onClick={() => handlePayment(payment)}
                            disabled={paymentProcessing}
                            className="w-full"
                          >
                            {paymentProcessing ? (
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            Pay Now
                          </Button>
                        ) : isSuccess ? (
                          <div className="flex items-center justify-center w-full text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            Payment Complete
                          </div>
                        ) : null}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between flex-wrap">
            <div className="text-sm text-muted-foreground">
              Showing {filteredPayments.length} payment records
            </div>
            <div className="text-sm">
              {payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED').length} paid, 
              {payments.filter(p => p.status === 'PENDING').length} pending
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ServiceChargePayments;
