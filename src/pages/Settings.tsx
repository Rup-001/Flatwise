
import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Button, Form, Input, Switch, Select, Card, Divider, Typography, message } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('account');

  const handleSave = () => {
    setLoading(true);
    form.validateFields()
      .then(values => {
        console.log('Success:', values);
        message.success('Settings saved successfully!');
        setLoading(false);
      })
      .catch(info => {
        console.log('Failed:', info);
        message.error('Failed to save settings.');
        setLoading(false);
      });
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'account':
        return (
          <Card className="ant-settings-card">
            <Title level={4}>Account Settings</Title>
            <Divider />
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: 'John Doe',
                email: 'john.doe@example.com',
                language: 'english',
                timezone: 'utc+0',
              }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="language"
                label="Language"
              >
                <Select placeholder="Select a language">
                  <Option value="english">English</Option>
                  <Option value="spanish">Spanish</Option>
                  <Option value="french">French</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="timezone"
                label="Timezone"
              >
                <Select placeholder="Select a timezone">
                  <Option value="utc+0">UTC+0 (London)</Option>
                  <Option value="utc-5">UTC-5 (New York)</Option>
                  <Option value="utc-8">UTC-8 (Los Angeles)</Option>
                  <Option value="utc+5:30">UTC+5:30 (India)</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      case 'notifications':
        return (
          <Card className="ant-settings-card">
            <Title level={4}>Notification Settings</Title>
            <Divider />
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                emailNotifications: true,
                paymentReminders: true,
                maintenanceAlerts: true,
                updates: false,
              }}
            >
              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="paymentReminders"
                label="Payment Reminders"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="maintenanceAlerts"
                label="Maintenance Alerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="updates"
                label="Platform Updates"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      case 'security':
        return (
          <Card className="ant-settings-card">
            <Title level={4}>Security Settings</Title>
            <Divider />
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: 'Please input your new password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
              <Form.Item
                name="twoFactorAuth"
                label="Two-Factor Authentication"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { title: 'Home' },
            { title: 'Settings' },
          ]}
        />
        
        <div className="max-w-6xl mx-auto mb-8 animate-fade-in">
          <Title level={2} style={{ marginBottom: 16 }}>Settings</Title>
          <Text type="secondary">Manage your account preferences, notifications, and security settings</Text>
        </div>
        
        <Layout className="ant-settings-layout">
          <Sider
            width={250}
            theme="light"
            style={{ 
              background: "white", 
              borderRadius: "8px 0 0 8px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)"
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              style={{ height: '100%' }}
              onClick={({ key }) => setSelectedMenu(key as string)}
              items={[
                {
                  key: 'account',
                  icon: <UserOutlined />,
                  label: 'Account',
                },
                {
                  key: 'notifications',
                  icon: <BellOutlined />,
                  label: 'Notifications',
                },
                {
                  key: 'security',
                  icon: <LockOutlined />,
                  label: 'Security',
                },
              ]}
            />
          </Sider>
          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </div>
      
      {/* Fix for the style element - removing jsx and global attributes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ant-settings-layout {
          background: transparent;
        }
        .ant-settings-layout .ant-layout-content {
          background: transparent;
        }
        .ant-settings-card {
          min-height: 500px;
          border-radius: 0 8px 8px 0;
        }
        .ant-menu-item-selected {
          background-color: #f0f0f0 !important;
        }
      `}} />
    </div>
  );
};

export default Settings;
