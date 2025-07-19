import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Mail, CheckCircle, Clock, RefreshCw, X, ArrowRight, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useFlats } from '@/hooks/use-flats';
import { SocietyUser } from '@/hooks/use-society-users';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';

interface InviteFormProps {
  type: 'owner' | 'renter';
  onSubmit: (data: any) => void;
  onSkip: () => void;
  showInvitedUsers?: boolean;
  existingUsers?: SocietyUser[];
  ownersList?: SocietyUser[];
}

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  flatId: z.string().min(1, "Flat is required")
});

const formSchema = z.object({
  users: z.array(userSchema)
});

const InviteForm: React.FC<InviteFormProps> = ({ 
  type, 
  onSubmit, 
  onSkip, 
  showInvitedUsers = false,
  existingUsers = [],
  ownersList = [] 
}) => {
  const [users, setUsers] = useState([{ id: '1', email: '', name: '', flatId: '' }]);
  const { society } = useAppContext();
  const [flats, setFlats] = useState<{id: string, number: string, owner_id?: number}[]>([]);
  const [isFlatsLoading, setIsFlatsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: [{ email: '', name: '', flatId: '' }]
    }
  });

  useEffect(() => {
    const fetchFlats = async () => {
      if (!society.current?.id) return;
      
      setIsFlatsLoading(true);
      try {
        const societyId = society.current.id;
        const response = await apiRequest<any[]>(
          `${ENDPOINTS.FLATS}/society/${societyId}`,
          "GET"
        );
        
        const formattedFlats = response.map(flat => ({
          id: String(flat.id),
          number: flat.number,
          owner_id: flat.owner_id
        }));
        
        setFlats(formattedFlats);
      } catch (error) {
        console.error("Error fetching flats:", error);
        toast.error("Failed to load flats");
      } finally {
        setIsFlatsLoading(false);
      }
    };
    
    fetchFlats();
  }, [society.current?.id]);

  const getAvailableFlats = () => {
    if (type === 'owner') {
      return flats.map(flat => ({
        id: flat.id,
        name: flat.number
      }));
    } else {
      return flats
        .filter(flat => flat.owner_id)
        .map(flat => ({
          id: flat.id,
          name: flat.number
        }));
    }
  };

  const handleAddUser = () => {
    const newId = (users.length + 1).toString();
    setUsers([...users, { id: newId, email: '', name: '', flatId: '' }]);
    
    form.setValue('users', [
      ...form.getValues().users,
      { email: '', name: '', flatId: '' }
    ]);
  };

  const handleRemoveUser = (index: number) => {
    if (users.length > 1) {
      const updatedUsers = [...users];
      updatedUsers.splice(index, 1);
      setUsers(updatedUsers);
      
      const currentFormUsers = [...form.getValues().users];
      currentFormUsers.splice(index, 1);
      form.setValue('users', currentFormUsers);
    } else {
      toast.warning(`You need at least one ${type}`);
    }
  };

  const handleChange = (value: string, index: number, field: keyof typeof users[0]) => {
    const updatedUsers = [...users];
    updatedUsers[index][field] = value;
    setUsers(updatedUsers);
    
    const currentFormUsers = [...form.getValues().users];
    currentFormUsers[index][field === 'id' ? 'email' : field] = value;
    form.setValue('users', currentFormUsers);
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => {
      onSubmit(data);
    })();
  };

  const handleResendInvitation = (userId: string) => {
    toast.success(`Invitation resent to user #${userId}`);
  };

  const handleCancelInvitation = (userId: string) => {
    toast.success(`Invitation canceled for user #${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    toast.info(`Navigating to profile of user #${userId}`);
    // In a real app, this would navigate to the user's profile
  };

  const getUserStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-soft animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl capitalize">
          {type === 'owner' ? 'Invite Flat Owners' : 'Invite Renters'}
        </CardTitle>
        <CardDescription>
          {type === 'owner' 
            ? 'Send invitations to flat owners to join the society management system.' 
            : 'Add renters to keep track of all occupants in your building.'}
        </CardDescription>
      </CardHeader>
      <CardContent>

      <Form {...form}>
          <div className="space-y-6">
            <h3 className="text-lg font-medium capitalize">Add New {type}s</h3>
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="p-4 border border-border rounded-lg animate-fade-in bg-white"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium capitalize">{type} {index + 1}</h3>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveUser(index)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`users.${index}.email`}
                    render={() => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={user.email}
                            onChange={(e) => handleChange(e.target.value, index, 'email')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`users.${index}.name`}
                    render={() => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full Name"
                            value={user.name}
                            onChange={(e) => handleChange(e.target.value, index, 'name')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`users.${index}.flatId`}
                    render={() => (
                      <FormItem>
                        <FormLabel>Flat</FormLabel>
                        <Select
                          value={user.flatId}
                          onValueChange={(value) => handleChange(value, index, 'flatId')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isFlatsLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading flats...</span>
                              </div>
                            ) : getAvailableFlats().length > 0 ? (
                              getAvailableFlats().map(flat => (
                                <SelectItem key={flat.id} value={flat.id}>
                                  {flat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground">
                                No available flats found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddUser}
              className=""
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another {type === 'owner' ? 'Owner' : 'Renter'}
            </Button>
            
            <div className="flex justify-end mt-6">
              {/* <Button 
                type="button" 
                variant="outline"
                onClick={onSkip}
              >
                Skip
              </Button> */}
              
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="btn-hover-grow"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </div>
          </div>
        </Form>
        
        {showInvitedUsers && existingUsers && existingUsers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 capitalize">{type === 'owner' ? 'Owners' : 'Renters'} ({existingUsers.length})</h3>
            <div className="space-y-3 bg-secondary/20 rounded-lg p-4">
              {existingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary/70" />
                    <div>
                      <p className="font-medium">{user.fullname}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type === 'owner' && user.owned_flats && (
                          <span>Flats: {user.owned_flats.map(flat => flat.number).join(', ')}</span>
                        )}
                        {type === 'renter' && user.rented_flats && (
                          <span>Flats: {user.rented_flats.map((flat: any) => flat.number).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getUserStatusBadge(user.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => user.status === 'ACTIVE' ? handleViewProfile(String(user.id)) : handleResendInvitation(String(user.id))}
                      title={user.status === 'ACTIVE' ? "View Profile" : "Resend Invitation"}
                    >
                      {user.status === 'ACTIVE' ? (
                        <ArrowRight className="h-4 w-4 text-primary" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                    {user.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelInvitation(String(user.id))}
                        title="Cancel Invitation"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
      </CardContent>
    </Card>
  );
};

export default InviteForm;
