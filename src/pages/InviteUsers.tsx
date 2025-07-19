
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteForm from '@/components/InviteForm';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSocietyUsers } from '@/hooks/use-society-users';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface InviteResponse {
  successful: Array<{
    id: number;
    email: string;
    invitationId: number;
  }>;
  failed: Array<any>;
}

const InviteUsers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'owners' | 'renters'>('owners');
  const { users, isLoading, error, fetchUsers, inviteUsers } = useSocietyUsers();
  const { auth } = useAppContext();
  
  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated) {
      toast.error("Please login to access this page", {
        duration: 3000,
        closeButton: true,
      });
      navigate('/login');
      return;
    }
    
    // Fetch users data
    fetchUsers();
  }, [auth.isAuthenticated, navigate, fetchUsers]);
  
  const handleOwnerSubmit = async (data: any) => {
    try {
      const usersToInvite = data.users.map((user: any) => ({
        name: user.name,
        email: user.email,
        userType: 'owner',
        flatId: user.flatId
      }));
      
      const result = await inviteUsers(usersToInvite) as InviteResponse;
      
      if (result.successful && result.successful.length > 0) {
        toast.success(`${result.successful.length} owners invited successfully!`);
        setActiveTab('renters');
        // Refresh users data
        fetchUsers();
      } else {
        toast.warning('No owners were invited successfully');
      }
    } catch (error) {
      toast.error('Failed to invite owners');
    }
  };
  
  const handleRenterSubmit = async (data: any) => {
    try {
      const usersToInvite = data.users.map((user: any) => ({
        name: user.name,
        email: user.email,
        userType: 'resident',
        flatId: user.flatId
      }));
      
      const result = await inviteUsers(usersToInvite) as InviteResponse;
      
      if (result.successful && result.successful.length > 0) {
        toast.success(`${result.successful.length} renters invited successfully!`);
        navigate('/dashboard');
      } else {
        toast.warning('No renters were invited successfully');
      }
    } catch (error) {
      toast.error('Failed to invite renters');
    }
  };
  
  // Add all users (both owners and residents) for the renter selection
  const allUsers = [...(users.owners || []), ...(users.residents || [])];
  
  const handleOwnerSkip = () => {
    toast.info('Skipped inviting owners');
    setActiveTab('renters');
  };
  
  const handleRenterSkip = () => {
    toast.info('Skipped inviting renters');
    navigate('/dashboard');
  };
  
  const handleComplete = () => {
    toast.success('User management completed successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-primary-800">
            Manage Building Contacts
          </h1>
          <p className="text-primary-600 max-w-2xl">
            View and manage owners and renters for your building. You can invite new users or skip this step and invite them later.
          </p>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading users...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers} 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <Tabs
            defaultValue="owners"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'owners' | 'renters')}
            className="animate-fade-in"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="owners" className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Flat Owners
              </TabsTrigger>
              <TabsTrigger value="renters" className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Renters
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="owners" className="animate-fade-in">
              <InviteForm 
                type="owner" 
                onSubmit={handleOwnerSubmit} 
                onSkip={handleOwnerSkip}
                showInvitedUsers={true}
                existingUsers={users.owners}
              />
            </TabsContent>
            
            <TabsContent value="renters" className="animate-fade-in">
              <InviteForm 
                type="renter" 
                onSubmit={handleRenterSubmit} 
                onSkip={handleRenterSkip}
                showInvitedUsers={true}
                existingUsers={users.residents}
                ownersList={allUsers}
              />
              
              {/* <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={handleComplete}
                  className="btn-hover-grow"
                >
                  Complete Setup & Go to Dashboard
                </Button>
              </div> */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default InviteUsers;
