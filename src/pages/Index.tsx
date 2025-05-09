
import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Shield, Users, BarChart4, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/30 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Simplify <span className="text-primary-600">Service Charge</span> Management
              </h1>
              <p className="text-xl md:text-2xl text-primary-800/80 mb-8 md:max-w-xl">
                A seamless platform for building societies to manage service charges effectively. Streamline your operations and enhance transparency.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="btn-hover-grow bg-primary-600 hover:bg-primary-700 text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="btn-hover-grow border-primary-200 text-primary-700 hover:bg-primary-50">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full h-[400px] bg-gradient-to-br from-accent/10 to-primary-100 rounded-2xl shadow-xl overflow-hidden border border-primary-200">
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <Building className="h-32 w-32 text-primary-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-white to-primary-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-800">Features</h2>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto">
              Everything you need to manage service charges efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Building Management</h3>
              <p className="text-primary-600">
                Easily manage multiple buildings, units and residents in one place.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Secure Payments</h3>
              <p className="text-primary-600">
                Process service charge payments securely with real-time tracking.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Resident Portal</h3>
              <p className="text-primary-600">
                Give residents access to view their charges and payment history.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <BarChart4 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Financial Reports</h3>
              <p className="text-primary-600">
                Generate detailed financial reports and export them as needed.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Maintenance Tracking</h3>
              <p className="text-primary-600">
                Track maintenance requests and expenses for your building.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-primary-100 transition-all duration-300 hover:shadow-lg hover:border-primary-200 group">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700">Document Storage</h3>
              <p className="text-primary-600">
                Store and share important building documents securely.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-primary-600 to-accent rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to streamline your service charge management?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Join thousands of building societies that have streamlined their operations and improved resident satisfaction with our platform.
            </p>
            <Link to="/register">
              <Button size="lg" className="btn-hover-grow bg-white text-primary-700 hover:bg-primary-50">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-primary-100 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building className="h-6 w-6 text-primary-600 mr-2" />
              <span className="font-medium text-primary-700">FlatWise</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/support" className="text-primary-600 hover:text-primary-800">Support</Link>
              <Link to="/" className="text-primary-600 hover:text-primary-800">Home</Link>
            </div>
            <div>
              <p className="text-sm text-primary-600">
                © {new Date().getFullYear()} FlatWise. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
