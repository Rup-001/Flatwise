

import { Card, CardContent } from '@/components/ui/card';
import { Bill, BillSummary } from '@/types/bill';

interface BillSummaryCardsProps {
  bills: Bill[];
  currency?: string; // Added for dynamic currency symbol
}

export const BillSummaryCards = ({ bills, currency = "৳ " }: BillSummaryCardsProps) => {
  const summary: BillSummary = bills.reduce((acc: BillSummary, bill) => ({
    totalBills: acc.totalBills + 1,
    paidBills: bill.status === 'PAID' ? acc.paidBills + 1 : acc.paidBills,
    pendingBills: bill.status === 'PENDING' ? acc.pendingBills + 1 : acc.pendingBills,
    totalAmount: acc.totalAmount + bill.total_amount,
    paidAmount: bill.status === 'PAID' ? acc.paidAmount + bill.total_amount : acc.paidAmount,
    pendingAmount: bill.status === 'PENDING' ? acc.pendingAmount + bill.total_amount : acc.pendingAmount,
  }), {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600">{summary.paidBills}/{summary.totalBills}</span>
            <p className="text-sm text-gray-600 mt-1">Bills Paid</p>
            <div className="w-full bg-blue-200 h-2 rounded-full mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(summary.paidBills / summary.totalBills * 100) || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="pt-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-green-600">{currency}{summary.paidAmount}</span>
            <p className="text-sm text-gray-600 mt-1">Amount Received</p>
            <p className="text-xs text-green-600 mt-3">From {summary.paidBills} paid bills</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
        <CardContent className="pt-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-amber-600">{currency}{summary.pendingAmount}</span>
            <p className="text-sm text-gray-600 mt-1">Amount Pending</p>
            <p className="text-xs text-amber-600 mt-3">From {summary.pendingBills} pending bills</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

