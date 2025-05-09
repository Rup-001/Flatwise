
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBills } from '@/hooks/use-bills';
import { BillSummaryCards } from '@/components/bills/BillSummaryCards';
import { Bill } from '@/types/bill';
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from 'antd';
import { toast } from 'sonner';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { CheckCircle, Clock } from 'lucide-react';

const UserBills = () => {
  const { auth } = useAppContext();
  const { userBills, isLoading } = useBills();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  
  console.log("User Bills Page loaded", { userBills, auth });

  const filterBills = (bills: Bill[]) => {
    if (!bills || !Array.isArray(bills)) {
      console.error("Bills is not an array:", bills);
      return [];
    }
    
    return bills.filter(bill => {
      const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
      
      let matchesMonth = true;
      if (selectedMonth) {
        try {
          const billDate = parseISO(bill.bill_month);
          matchesMonth = 
            billDate.getMonth() === selectedMonth.getMonth() && 
            billDate.getFullYear() === selectedMonth.getFullYear();
        } catch (error) {
          console.error("Error parsing bill date:", error, bill.bill_month);
          return false;
        }
      }
      
      return matchesStatus && matchesMonth;
    });
  };

  const filteredUserBills = filterBills(userBills);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handlePayment = async (billId: number) => {
    try {
      const bill = userBills.find(b => b.id === billId);
      if (!bill || !auth.user?.id) {
        throw new Error('Missing required payment information');
      }

      const flatId = bill.flat?.id || bill.flat_id;
      const societyId = bill.society?.id || bill.society_id;
      
      if (!flatId || !societyId) {
        console.error("Missing required IDs for payment:", { 
          bill, 
          flatId, 
          societyId 
        });
        throw new Error('Missing flat or society information');
      }

      const paymentData = {
        user_id: Number(auth.user.id),
        flat_id: Number(flatId),
        bill_id: bill.id,
        society_id: Number(societyId),
        amount: bill.total_amount,
        payment_month: bill.bill_month
      };

      console.log("Payment data:", paymentData);

      const response = await apiRequest<{ payment_url: string }>(
        `${ENDPOINTS.PAYMENTS}/initiate`,
        'POST',
        paymentData
      );
      
      if (response && response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        toast.error('No payment URL received from the server');
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  const handleTransferBill = async (bill: Bill) => {
    try {
      if (!bill.owner?.id || !bill.residents?.resident?.id) {
        toast.error('Cannot transfer: Required data missing.');
        return;
      }
      if (bill.user_id !== bill.owner.id) {
        toast.error('This bill is not assigned to the owner.');
        return;
      }
      const response = await apiRequest<Bill>(
        `${ENDPOINTS.BILLS}/${bill.id}/assign`,
        'POST',
        {
          ownerId: bill.owner.id,
          residentId: bill.residents.resident.id,
        }
      );
      if (response && response.id) {
        toast.success('Bill transferred to resident!');
      } else {
        throw new Error('Unexpected response');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to transfer bill');
      console.error(e);
    }
  };

  // Helper: Bill can be transferred
  const canTransfer = (bill: Bill) => {
    return (
      bill.owner &&
      bill.residents &&
      bill.residents.resident &&
      bill.user_id === bill.owner.id &&
      bill.status === 'PENDING'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bills</h1>
          <p className="text-gray-600">View and manage your bills</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <DatePicker.MonthPicker 
            onChange={(date) => setSelectedMonth(date ? date.toDate() : null)}
            placeholder="Select Month"
          />
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BillSummaryCards bills={filteredUserBills} currency="৳" />
        
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUserBills && filteredUserBills.length > 0 ? (
              filteredUserBills.map((bill) => (
                <Card 
                  key={bill.id}
                  className={`
                    ${bill.status === 'PAID' ? 'bg-gradient-to-br from-green-50 to-green-100' : 
                      'bg-gradient-to-br from-amber-50 to-amber-100'}
                  `}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{format(parseISO(bill.bill_month), 'MMMM yyyy')}</CardTitle>
                      {bill.status === 'PAID' ? 
                        <CheckCircle className="h-6 w-6 text-green-600" /> : 
                        <Clock className="h-6 w-6 text-amber-600" />
                      }
                    </div>
                    <CardDescription>
                      Flat: {bill.flat?.number || 'N/A'} • {bill.society?.name || 'N/A'}
                      <br />
                      Assigned to: <span className="font-semibold">
                        {bill.owner && bill.user_id === bill.owner.id
                          ? bill.owner.fullname
                          : bill.residents?.resident?.fullname || 'N/A'
                        }
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Amount Due</p>
                        <p className="text-2xl font-bold">৳{bill.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${bill.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                            'bg-amber-100 text-amber-800'}`}>
                          {bill.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">Charges:</p>
                        <div className="pl-2 space-y-1">
                          {bill.common_charges && bill.common_charges.map((charge, idx) => (
                            <div key={`common-${idx}`} className="flex justify-between">
                              <span>{charge.name}</span>
                              <span>৳{charge.amount}</span>
                            </div>
                          ))}
                          {bill.flat_charges && bill.flat_charges.map((charge, idx) => (
                            <div key={`flat-${idx}`} className="flex justify-between">
                              <span>{charge.name}</span>
                              <span>৳{charge.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {bill.status === 'PENDING' && (
                        <Button 
                          onClick={() => handlePayment(bill.id)}
                          className="w-full"
                        >
                          Pay Now
                        </Button>
                      )}
                      {canTransfer(bill) && (
                        <Button 
                          onClick={() => handleTransferBill(bill)}
                          className="w-full bg-blue-100 text-blue-900 hover:bg-blue-200 mt-2"
                          variant="outline"
                        >
                          Transfer Bill to Resident
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No bills found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserBills;
