
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Upload, Button as AntButton, Tabs, Avatar, Card } from 'antd';
import { UserOutlined, UploadOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState('/lovable-uploads/bd36f66b-8994-43ce-bf09-d00002f68230.png');
  
  // Mock user data
  const userData = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    flat: 'Flat 203',
    building: 'Green Valley Heights',
    memberSince: 'January 2022',
  };

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
              <Avatar size={96} src={avatarUrl} icon={<UserOutlined />} />
              <div>
                <Title level={3} className="mb-1">{userData.name}</Title>
                <Text type="secondary">{userData.flat}, {userData.building}</Text>
                <div className="mt-2">
                  <Text type="secondary" className="block">Member since {userData.memberSince}</Text>
                </div>
              </div>
            </div>
            
            <Tabs defaultActiveKey="1">
              <TabPane tab="Profile" key="1">
                <Card bordered={false}>
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                    }}
                    onFinish={handleSubmit}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        label="Profile Picture"
                        name="avatar"
                      >
                        <Upload
                          name="avatar"
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                          beforeUpload={(file) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (e.target?.result) {
                                setAvatarUrl(e.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                            return false;
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <UploadOutlined />
                            <div className="mt-2">Upload</div>
                          </div>
                        </Upload>
                      </Form.Item>
                      
                      <div />
                      
                      <Form.Item
                        label="Full Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Flat Details"
                        name="flat"
                      >
                        <Input 
                          prefix={<HomeOutlined />} 
                          disabled 
                          value={`${userData.flat}, ${userData.building}`} 
                          placeholder="Flat Details" 
                        />
                      </Form.Item>
                    </div>
                    
                    <Form.Item>
                      <AntButton type="primary" htmlType="submit" className="mt-4">
                        Save Changes
                      </AntButton>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>
              
              <TabPane tab="Change Password" key="2">
                <Card bordered={false}>
                  <Form
                    layout="vertical"
                    onFinish={(values) => console.log('Password change:', values)}
                  >
                    <Form.Item
                      label="Current Password"
                      name="currentPassword"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
                    </Form.Item>
                    
                    <Form.Item
                      label="New Password"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Confirm New Password"
                      name="confirmPassword"
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
                    </Form.Item>
                    
                    <Form.Item>
                      <AntButton type="primary" htmlType="submit" className="mt-4">
                        Change Password
                      </AntButton>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>
              
              <TabPane tab="Preferences" key="3">
                <Card bordered={false}>
                  <Form
                    layout="vertical"
                    onFinish={(values) => console.log('Preferences:', values)}
                  >
                    <Form.Item
                      name="emailNotifications"
                      valuePropName="checked"
                      label="Email Notifications"
                    >
                      <AntButton.Group>
                        <AntButton type="primary">Enable</AntButton>
                        <AntButton>Disable</AntButton>
                      </AntButton.Group>
                    </Form.Item>
                    
                    <Form.Item
                      name="paymentReminders"
                      valuePropName="checked"
                      label="Payment Reminders"
                    >
                      <AntButton.Group>
                        <AntButton type="primary">Enable</AntButton>
                        <AntButton>Disable</AntButton>
                      </AntButton.Group>
                    </Form.Item>
                    
                    <Form.Item>
                      <AntButton type="primary" htmlType="submit" className="mt-4">
                        Save Preferences
                      </AntButton>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
