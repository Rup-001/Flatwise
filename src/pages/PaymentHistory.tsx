
import React, { useState } from 'react';
import { Typography, DatePicker, Button as AntButton, Select, Tag, Card, Space } from 'antd';
import { DownloadOutlined, FilterOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import ResponsiveTable from '@/components/ui/responsive-table';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentHistory = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const isMobile = useIsMobile();
  
  // Mock payment data
  const paymentData = [
    {
      id: '1',
      month: 'April 2023',
      dueDate: '2023-04-05',
      amount: 1800,
      status: 'Paid',
      paymentDate: '2023-04-03',
      paymentMethod: 'UPI',
      receiptId: 'RCT-4501',
    },
    {
      id: '2',
      month: 'March 2023',
      dueDate: '2023-03-05',
      amount: 1800,
      status: 'Paid',
      paymentDate: '2023-03-04',
      paymentMethod: 'Credit Card',
      receiptId: 'RCT-4390',
    },
    {
      id: '3',
      month: 'February 2023',
      dueDate: '2023-02-05',
      amount: 1800,
      status: 'Paid',
      paymentDate: '2023-02-05',
      paymentMethod: 'Bank Transfer',
      receiptId: 'RCT-4288',
    },
    {
      id: '4',
      month: 'January 2023',
      dueDate: '2023-01-05',
      amount: 1800,
      status: 'Paid',
      paymentDate: '2023-01-04',
      paymentMethod: 'UPI',
      receiptId: 'RCT-4175',
    },
    {
      id: '5',
      month: 'December 2022',
      dueDate: '2022-12-05',
      amount: 1800,
      status: 'Paid',
      paymentDate: '2022-12-03',
      paymentMethod: 'Cash',
      receiptId: 'RCT-4101',
    },
    {
      id: '6',
      month: 'November 2022',
      dueDate: '2022-11-05',
      amount: 1600,
      status: 'Paid',
      paymentDate: '2022-11-02',
      paymentMethod: 'UPI',
      receiptId: 'RCT-3988',
    },
    {
      id: '7',
      month: 'October 2022',
      dueDate: '2022-10-05',
      amount: 1600,
      status: 'Late Payment',
      paymentDate: '2022-10-12',
      paymentMethod: 'UPI',
      receiptId: 'RCT-3875',
    },
    {
      id: '8',
      month: 'September 2022',
      dueDate: '2022-09-05',
      amount: 1600,
      status: 'Paid',
      paymentDate: '2022-09-04',
      paymentMethod: 'Credit Card',
      receiptId: 'RCT-3762',
    },
  ];

  const columns = [
    {
      key: 'month',
      title: 'Month',
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (date: string) => format(new Date(date), 'dd MMM yyyy'),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (amount: number) => `৳ ${amount}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Late Payment') {
          color = 'orange';
        } else if (status === 'Pending') {
          color = 'volcano';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      key: 'paymentDate',
      title: 'Payment Date',
      render: (date: string) => (date ? format(new Date(date), 'dd MMM yyyy') : '-'),
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
    },
    {
      key: 'receipt',
      title: 'Receipt',
      render: (_: any, record: any) => (
        <Space size="middle">
          <AntButton 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => console.log(`Downloading receipt ${record.receiptId}`)}
          >
            {!isMobile && 'Download'}
          </AntButton>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <Card bordered={false} className="shadow-md">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="w-full md:w-auto mb-4 md:mb-0">
                <Title level={3} style={{ marginBottom: 4 }}>Payment History</Title>
                <Text type="secondary">View and download payment receipts</Text>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <AntButton 
                  icon={<FileExcelOutlined />}
                  onClick={() => console.log('Export to Excel')}
                >
                  {!isMobile && 'Export to Excel'}
                </AntButton>
                <AntButton 
                  icon={<FilePdfOutlined />}
                  onClick={() => console.log('Export to PDF')}
                >
                  {!isMobile && 'Export to PDF'}
                </AntButton>
              </div>
            </div>
            
            {/* Filter section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Text strong className="block mb-2">Date Range</Text>
                  <RangePicker 
                    className="w-full"
                    onChange={(dates) => {
                      if (dates) {
                        setDateRange([dates[0]?.toDate() || null, dates[1]?.toDate() || null]);
                      } else {
                        setDateRange([null, null]);
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Text strong className="block mb-2">Payment Status</Text>
                  <Select
                    defaultValue="all"
                    style={{ width: '100%' }}
                    onChange={(value) => setFilterStatus(value)}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="paid">Paid</Option>
                    <Option value="late">Late Payment</Option>
                    <Option value="pending">Pending</Option>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <AntButton 
                    type="primary" 
                    icon={<FilterOutlined />}
                    className="w-full sm:w-auto"
                    onClick={() => console.log('Filter applied')}
                  >
                    Apply Filters
                  </AntButton>
                </div>
              </div>
            </div>
            
            {/* Table section */}
            <div className="overflow-x-auto">
              <ResponsiveTable 
                columns={columns}
                data={paymentData}
                className="w-full"
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;
