import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Users, Loader2, RefreshCw, Pencil, Plus, Save, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { useSocietyUsers } from '@/hooks/use-society-users';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWithEmptyValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Flat {
  id: number;
  number: string;
  society_id: number;
  owner_id: number | null;
  resident_id: number | null;
  flat_type: string;
  created_at: string;
  society: {
    id: number;
    name: string;
    service_charges: Array<{
      id: number;
      society_id: number;
      predefined_service_charge_id: number;
      flat_type: string;
      amount: string;
      created_at: string;
      predefined_service_charge: {
        id: number;
        name: string;
        description: string | null;
      };
    }>;
  };
  owner: {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    status: string;
  } | null;
  residents: Array<any>;
  user_service_charges: Array<{
    id: number;
    flat_id: number;
    predefined_service_charge_id: number;
    amount: string;
    created_at: string;
    predefined_service_charge: {
      id: number;
      name: string;
      description: string | null;
    };
  }>;
}

interface EditableFlat {
  id: number;
  number: string;
  type: string;
  owner_id: number | null;
  resident_id: number | null;
}

interface ExtraCharge {
  id: number;
  type: string;
  name: string;
  amount: string;
}

const ManageFlats = () => {
  const navigate = useNavigate();
  const { auth, society } = useAppContext();
  const { owners, residents, fetchUsers } = useSocietyUsers();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [editFlat, setEditFlat] = useState<EditableFlat | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [currentFlatId, setCurrentFlatId] = useState<number | null>(null);
  const [predefinedCharges, setPredefinedCharges] = useState<any[]>([]);
  const [newCharge, setNewCharge] = useState({
    type: '',
    amount: '',
    description: ''
  });
  
  const fetchFlats = async () => {
    if (!society.current?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const societyId = society.current.id;
      const response = await apiRequest<Flat[]>(
        `${ENDPOINTS.FLATS}/society/${societyId}`,
        "GET"
      );
      
      setFlats(response);
      console.log("Fetched flats:", response);
    } catch (err: any) {
      console.error("Error fetching flats:", err);
      setError(err.message || "Failed to load flats data");
      toast.error("Failed to load flats data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPredefinedCharges = async () => {
    try {
      const response = await apiRequest<any[]>(
        ENDPOINTS.PREDEFINED_SERVICE_CHARGES,
        "GET"
      );
      setPredefinedCharges(response);
    } catch (err) {
      console.error("Error fetching predefined charges:", err);
      toast.error("Failed to load service charge types");
    }
  };
  
  useEffect(() => {
    if (!auth.isAuthenticated) {
      toast.error("Please login to access this page");
      navigate('/login');
      return;
    }
    
    fetchFlats();
    fetchPredefinedCharges();
    fetchUsers();
  }, [auth.isAuthenticated, society.current?.id]);
  
  const handleRefresh = () => {
    fetchFlats();
    fetchUsers();
  };
  
  const openEditDialog = (flat: Flat) => {
    const typeMap: Record<string, string> = {
      "TWO_BHK": "2 BHK",
      "THREE_BHK": "3 BHK",
      "FOUR_BHK": "4 BHK"
    };
    
    setEditFlat({
      id: flat.id,
      number: flat.number,
      type: typeMap[flat.flat_type] || flat.flat_type,
      owner_id: flat.owner_id,
      resident_id: flat.resident_id
    });
    
    setIsEditDialogOpen(true);
  };
  
  
  const openChargeDialog = (flatId: number) => {
    setCurrentFlatId(flatId);
    setNewCharge({
      type: '',
      amount: '',
      description: ''
    });
    
    setIsChargeDialogOpen(true);
  };
  
  const handleEditSave = async () => {
    if (!editFlat) return;
    
    try {
      const updateData = {
        id: editFlat.id,
        number: editFlat.number,
        society_id: society.current?.id,
        owner_id: editFlat.owner_id,
        resident_id: editFlat.resident_id,
        flat_type: flats.find(f => f.id === editFlat.id)?.flat_type
      };
      
      await apiRequest(
        `${ENDPOINTS.FLATS}/${editFlat.id}`,
        "PATCH",
        updateData
      );
      
      setFlats(prevFlats => 
        prevFlats.map(flat => 
          flat.id === editFlat.id 
            ? { 
                ...flat, 
                number: editFlat.number,
                owner_id: editFlat.owner_id,
                resident_id: editFlat.resident_id,
                owner: owners.find(o => o.id === editFlat.owner_id) || null
              } 
            : flat
        )
      );
      
      toast.success(`Flat ${editFlat.number} updated successfully`);
      setIsEditDialogOpen(false);
      
      fetchFlats();
    } catch (error) {
      console.error("Error updating flat:", error);
      toast.error("Failed to update flat");
    }
  };
  
  const handleAddCharge = async () => {
    if (!currentFlatId || !newCharge.type || !newCharge.amount) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const response = await apiRequest<{id: number}>(
        ENDPOINTS.USER_SERVICE_CHARGES,
        "POST",
        {
          flat_id: currentFlatId,
          predefined_service_charge_id: parseInt(newCharge.type),
          amount: newCharge.amount
        }
      );
      
      setFlats(prevFlats => 
        prevFlats.map(flat => {
          if (flat.id === currentFlatId && response && typeof response === 'object' && 'id' in response) {
            const updatedCharge = {
              id: response.id,
              flat_id: currentFlatId,
              predefined_service_charge_id: parseInt(newCharge.type),
              amount: newCharge.amount,
              created_at: new Date().toISOString(),
              predefined_service_charge: predefinedCharges.find(
                pc => pc.id === parseInt(newCharge.type)
              ) || { id: parseInt(newCharge.type), name: "Service Charge", description: null }
            };
            
            return {
              ...flat,
              user_service_charges: [...flat.user_service_charges, updatedCharge]
            };
          }
          return flat;
        })
      );
      
      toast.success("Extra charge added successfully");
      setIsChargeDialogOpen(false);
    } catch (error) {
      console.error("Error adding charge:", error);
      toast.error("Failed to add charge");
    }
  };
  
  const handleRemoveCharge = async (chargeId: number, flatId: number) => {
    try {
      await apiRequest(
        `${ENDPOINTS.USER_SERVICE_CHARGES}/${chargeId}`,
        "DELETE"
      );
      
      setFlats(prevFlats => 
        prevFlats.map(flat => {
          if (flat.id === flatId) {
            return {
              ...flat,
              user_service_charges: flat.user_service_charges.filter(
                charge => charge.id !== chargeId
              )
            };
          }
          return flat;
        })
      );
      
      toast.success("Charge removed successfully");
    } catch (error) {
      console.error("Error removing charge:", error);
      toast.error("Failed to remove charge");
    }
  };
  
  const handleSaveAll = () => {
    toast.success("All changes saved successfully");
  };
  
  const handleCancelInvitation = async (userId: number) => {
    try {
      await apiRequest(
        `${ENDPOINTS.USERS}/${userId}/cancel`,
        "POST"
      );
      
      toast.success("Invitation cancelled successfully");
      
      fetchUsers();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  };
  
  const calculateBasicCharge = (flat: Flat): number => {
    let total = 0;
    const uniqueIds = new Set();
    
    flat.society.service_charges
      .filter(charge => charge.flat_type === flat.flat_type)
      .forEach(charge => {
        const key = charge.predefined_service_charge_id;
        
        if (!uniqueIds.has(key)) {
          uniqueIds.add(key);
          total += parseFloat(charge.amount);
        }
      });
    
    return total;
  };
  const typeOptions = {
    "TWO_BHK": "2 BHK",
    "THREE_BHK": "3 BHK",
    "FOUR_BHK": "4 BHK"
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-5xl mx-auto mb-6 animate-fade-in">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                Manage Flats
              </h1>
              <p className="text-purple-600 max-w-2xl">
                Customize flat details, assign owners and residents, and adjust additional service charges to individual flats.
              </p>
              {society.current && (
                <div className="mt-2 text-sm text-purple-500">
                  <span className="font-medium">Building:</span> {society.current.name} | 
                  <span className="font-medium ml-2">Total Flats:</span> {flats.length}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {/* <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button> */}
              <Link to="/invite-users">
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center gap-2 rounded-full">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              <span className="text-purple-600 font-medium">Loading flats...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-red-100">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle>All Flats</CardTitle>
              <CardDescription>
                View and manage all flats in your building
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flat</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Resident</TableHead>
                      <TableHead>Charges</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flats.map(flat => {
                      const flatType = flat.flat_type === "TWO_BHK" ? "2 BHK" :
                                    flat.flat_type === "THREE_BHK" ? "3 BHK" :
                                    flat.flat_type === "FOUR_BHK" ? "4 BHK" : flat.flat_type;
                      
                      const basicCharge = calculateBasicCharge(flat);
                      
                      // const resident = residents.find(r => r.id === flat.resident_id);
                      const resident = (flat.residents as any)?.resident;

                      
                      return (
                        <TableRow key={flat.id}>
                          <TableCell>
                            <div className="font-medium">{flat.number} ({flatType})</div>
                          </TableCell>
                          <TableCell>
                            {flat.owner ? (
                              <span className="flex items-center gap-1">
                                {flat.owner.fullname}
                                {flat.owner.status === "PENDING" && (
                                  <Badge variant="outline" className="ml-1 text-xs">Pending</Badge>
                                )}
                                {flat.owner.status === "PENDING" && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 ml-1 text-red-500"
                                    onClick={() => handleCancelInvitation(flat.owner?.id || 0)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Vacant</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {resident ? (
                              <span className="flex items-center gap-1">
                                {resident.fullname}
                                {resident.status === "PENDING" && (
                                  <Badge variant="outline" className="ml-1 text-xs">Pending</Badge>
                                )}
                                {resident.status === "PENDING" && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 ml-1 text-red-500"
                                    onClick={() => handleCancelInvitation(resident.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Vacant</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="mb-1">
                                <span className="font-medium">৳ {basicCharge}</span>
                                <span className="text-xs text-muted-foreground ml-1">basic</span>
                              </div>
                              {flat.user_service_charges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {flat.user_service_charges.map(charge => (
                                    <Badge key={charge.id} variant="outline" className="text-xs">
                                      {charge.predefined_service_charge.name}: ৳ {charge.amount}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(flat)}
                                className="flex items-center gap-1"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openChargeDialog(flat.id)}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Charges</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSaveAll}
                  className="bg-purple-600 hover:bg-purple-700 shadow-md"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </Button>
              </div> */}
            </CardContent>
          </Card>
        )}
      </main>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Flat {editFlat?.number}</DialogTitle>
            <DialogDescription>
              Update flat details and assign owner/resident
            </DialogDescription>
          </DialogHeader>
          
          {editFlat && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Flat Number</label>
                <Input 
                  value={editFlat.number || ''} 
                  onChange={(e) => setEditFlat(prev => prev ? {...prev, number: e.target.value} : null)}
                  placeholder="e.g. 101"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Owner</label>
                <Select 
                  value={editFlat.owner_id?.toString() || ''} 
                  onValueChange={(value) => setEditFlat(prev => prev ? {...prev, owner_id: value ? parseInt(value) : null} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id.toString()}>
                        {owner.fullname} {owner.status === "PENDING" ? "(Pending)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Resident</label>
                <SelectWithEmptyValue 
                  value={editFlat.resident_id?.toString() || ''} 
                  onValueChange={(value) => setEditFlat(prev => prev ? {...prev, resident_id: value ? parseInt(value) : null} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resident" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {residents.map(resident => (
                      <SelectItem key={resident.id} value={resident.id.toString()}>
                        {resident.fullname} {resident.status === "PENDING" ? "(Pending)" : ""}
                      </SelectItem>
                    ))}
                    {owners.map(owner => (
                      <SelectItem key={`owner-as-resident-${owner.id}`} value={owner.id.toString()}>
                        {owner.fullname} {owner.status === "PENDING" ? "(Pending)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithEmptyValue>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                {/* <Input 
                  value={editFlat.type || ''}
                  disabled
                  className="bg-gray-50"
                /> */}
                <select
                  value={Object.keys(typeOptions).find(key => typeOptions[key] === editFlat.type) || ''}
                  onChange={(e) => setEditFlat(prev => ({ ...prev, type: typeOptions[e.target.value] }))}
                  className="bg-white border border-gray-300 text-sm rounded px-2 py-1 w-full"
                >
                  <option value="" disabled>Select type</option>
                  {Object.entries(typeOptions).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>


              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isChargeDialogOpen} onOpenChange={setIsChargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Extra Charge</DialogTitle>
            <DialogDescription>
              Add an extra service charge to flat {flats.find(f => f.id === currentFlatId)?.number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Service Type</label>
              <Select 
                value={newCharge.type}
                onValueChange={(value) => setNewCharge(prev => ({...prev, type: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedCharges.map((charge) => (
                    <SelectItem key={charge.id} value={charge.id.toString()}>
                      {charge.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (৳ )</label>
              <Input 
                value={newCharge.amount}
                onChange={(e) => setNewCharge(prev => ({...prev, amount: e.target.value}))}
                placeholder="e.g. 500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
              <Input 
                value={newCharge.description}
                onChange={(e) => setNewCharge(prev => ({...prev, description: e.target.value}))}
                placeholder="e.g. Reserved parking slot"
              />
            </div>
            
            {currentFlatId && flats.find(f => f.id === currentFlatId)?.user_service_charges.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Existing Extra Charges</label>
                <div className="border rounded-md p-2">
                  {flats.find(f => f.id === currentFlatId)?.user_service_charges.map(charge => (
                    <div key={charge.id} className="flex justify-between items-center py-1 px-2 border-b last:border-b-0">
                      <div>
                        <span className="text-sm font-medium">
                          {charge.predefined_service_charge.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ৳ {charge.amount}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleRemoveCharge(charge.id, currentFlatId);
                          setIsChargeDialogOpen(false);
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChargeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCharge}>
              Add Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageFlats;
