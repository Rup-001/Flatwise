
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { MessageCircle, Mail, Phone } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600">Get help and support for your society management needs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Live Chat Support
              </CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Available Monday to Friday<br />
                9:00 AM - 6:00 PM BST
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email Support
              </CardTitle>
              <CardDescription>Send us an email</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:support@example.com" className="text-sm text-primary hover:underline">
                support@example.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Phone Support
              </CardTitle>
              <CardDescription>Call our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                +880 1234-567890<br />
                Available 24/7
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Support;
