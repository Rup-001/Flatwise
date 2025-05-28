
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  CreditCard, 
  ArrowRight, 
  Upload, 
  Home, 
  Percent, 
  DollarSign,
  Filter,
  FileText,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  RefreshCw,
  Receipt
} from 'lucide-react';
import ResponsiveTable from '@/components/ui/responsive-table';
import { Select, DatePicker, Space, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useAppContext } from '@/context/AppContext';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { Badge } from '@/components/ui/badge';



const { RangePicker } = DatePicker;
const { Option } = Select;

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

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAppContext();
  
  // User pays service charge status - safely access the property with a fallback
  const ownerPaysServiceCharge = auth.user?.pay_service_charge === true;
  
  // Mock data
  const [selectedMonth, setSelectedMonth] = useState('April 2023');
  const [selectedFlat, setSelectedFlat] = useState('All Flats');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [payments, setPayments] = useState([]);



  const fetchPayments = async () => {
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
      console.log("payments response", response);
      setPayments(response);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
    } finally {
      console.log("Finished fetchPayments");
    }
  };
  
  useEffect(() => {
    fetchPayments();
  }, []);
  




  
  // Mock stats
  const stats = {
    totalFlats: 32,
    paidFlats: 25,
    pendingFlats: 5,
    overdueFlats: 2,
    totalCollected: 47500,
    pendingAmount: 9000,
    collectionRate: Math.round((25/32) * 100)
  };

  // Export menu items
  const exportItems: MenuProps['items'] = [
    {
      key: 'excel',
      label: (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export as Excel</span>
        </div>
      ),
    },
    {
      key: 'pdf',
      label: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Export as PDF</span>
        </div>
      ),
    },
  ];

  // Define columns for the responsive table
  const columns = [
    {
      key: 'flat',
      title: 'Flat No.',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'resident',
      title: 'Resident',
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => `৳ ${value}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Paid' 
            ? 'bg-green-100 text-green-800' 
            : value === 'Pending'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      title: 'Payment Date',
      render: (value: string) => value || '-',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <Link to={`/payment/${record.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight animate-fade-in text-left">
            Building Dashboard
          </h1>
          <p className="text-muted-foreground max-w-xl animate-fade-in text-left" style={{ animationDelay: '100ms' }}>
            Manage your building, service charges, and residents all in one place.
          </p>
          
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link to="/manage-charges">
              <Button variant="default" className="gap-2 btn-hover-grow">
                <CreditCard className="h-4 w-4" />
                Manage Charges
              </Button>
            </Link>
            <Link to="/manage-flats">
              <Button variant="outline" className="gap-2 btn-hover-grow">
                <Home className="h-4 w-4" />
                Manage Flats
              </Button>
            </Link>
            <Link to="/invite-users">
              <Button variant="outline" className="gap-2 btn-hover-grow">
                <Users className="h-4 w-4" />
                Invite Users
              </Button>
            </Link>
            <Link to="/bills">
              <Button variant="outline" className="gap-2 btn-hover-grow">
                <Receipt className="h-4 w-4" />
                View All Bills
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xs p-4 rounded-lg border border-border/40 shadow-soft animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Green Valley Heights</h3>
              <p className="text-xs text-muted-foreground">32 Units • Managed by You</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">2 BHK</p>
              <p className="font-medium text-sm">12 units</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">3 BHK</p>
              <p className="font-medium text-sm">14 units</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">4 BHK</p>
              <p className="font-medium text-sm">6 units</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-soft animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{stats.paidFlats}/{stats.totalFlats}</span>
              <p className="text-sm text-muted-foreground mt-1">Flats Paid</p>
              <div className="w-full bg-secondary/50 h-2 rounded-full mt-3">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${stats.collectionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.collectionRate}% collection rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft animate-fade-in" style={{ animationDelay: '450ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-green-600">৳ {stats.totalCollected}</span>
              <p className="text-sm text-muted-foreground mt-1">Total Collected</p>
              <Link to="/bills">
                <Button variant="ghost" size="sm" className="mt-3 text-xs w-full">
                  View Statement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-amber-600">{stats.pendingFlats}</span>
              <p className="text-sm text-muted-foreground mt-1">Pending Payments</p>
              <p className="text-xs text-amber-600 font-medium mt-3">
                ৳ {stats.pendingAmount} to be collected
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* <Card className="shadow-soft animate-fade-in" style={{ animationDelay: '550ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-red-600">{stats.overdueFlats}</span>
              <p className="text-sm text-muted-foreground mt-1">Overdue Payments</p>
              <Button variant="outline" size="sm" className="mt-3 text-xs w-full text-red-600 border-red-200 hover:bg-red-50">
                Send Reminder
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
      
      <div className="border-t pt-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-left">All Resident Payments</h2>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button> */}
            <Link to="/bills">
              <Button variant="default" size="sm" className="gap-2">
                <Receipt className="h-4 w-4" />
                View Detailed Bills
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 text-left">Track and manage all resident payments across your building</p>
      </div>
      
      <Card className="shadow-soft mb-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-left">Building Payment Details</CardTitle>
              <CardDescription className="text-left">
                Track and manage payments for April 2023
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Dropdown menu={{ items: exportItems }} placement="bottomRight">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </Dropdown>
              
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 text-left">Month</p>
              <Select 
                defaultValue="April 2023" 
                style={{ width: 140 }}
                onChange={(value) => setSelectedMonth(value)}
              >
                <Option value="April 2023">April 2023</Option>
                <Option value="March 2023">March 2023</Option>
                <Option value="February 2023">February 2023</Option>
              </Select>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1 text-left">Flat Type</p>
              <Select 
                defaultValue="All Flats" 
                style={{ width: 140 }}
                onChange={(value) => setSelectedFlat(value)}
              >
                <Option value="All Flats">All Flats</Option>
                <Option value="2 BHK">2 BHK</Option>
                <Option value="3 BHK">3 BHK</Option>
                <Option value="4 BHK">4 BHK</Option>
              </Select>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1 text-left">Status</p>
              <Select 
                defaultValue="All Status" 
                style={{ width: 140 }}
                onChange={(value) => setSelectedStatus(value)}
              >
                <Option value="All Status">All Status</Option>
                <Option value="Paid">Paid</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Overdue">Overdue</Option>
              </Select>
            </div>
          </div>

          <Card>
          <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>tran_id</TableHead>
                      <TableHead>amount</TableHead>
                      <TableHead>payment_method</TableHead>
                      <TableHead>payment_month</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="font-medium">{payment.tran_id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">৳ {payment.amount}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{payment.payment_method}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {new Date(payment.payment_month).toLocaleDateString('en-GB', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === "SUCCESS" ? "default" : "destructive"}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}


                  </TableBody>
                </Table>
              </div>
              
              
            </CardContent>
          </Card>
          
          
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">Showing 5 of 32 flats</p>
            <Link to="/bills">
              <Button variant="outline" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
