import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest, ENDPOINTS } from '@/lib/api';
import { Flat } from '@/types/flat';
import { useAppContext } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectWithEmptyValue } from '@/components/ui/select';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ErrorLogger from '@/lib/errorLogger';

interface ExtendedFlat extends Flat {
  residents?: {
    id: number;
    flat_id: number;
    resident_id: number;
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    resident: {
      id: number;
      fullname: string;
      email: string;
      phone: string;
      status: string;
    };
  } | null;
  owner?: {
    id: number;
    fullname: string;
    email: string;
    status: string;
  } | null;
  user_service_charges: any[];
}

const flatSchema = z.object({
  number: z.string().min(1, {
    message: 'Flat number is required.',
  }),
  flat_type: z.enum(['TWO_BHK', 'THREE_BHK', 'FOUR_BHK'], {
    required_error: 'Please select a flat type.',
  }),
  owner_id: z.string().optional(),
  resident_id: z.string().optional(),
});

type FlatFormValues = z.infer<typeof flatSchema>;

const FlatManagement = () => {
  const [flats, setFlats] = useState<ExtendedFlat[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState<ExtendedFlat | null>(null);
  const [owners, setOwners] = useState<{ id: number; fullname: string }[]>([]);
  const [residents, setResidents] = useState<{ id: number; fullname: string }[]>([]);
  const { auth } = useAppContext();
  const societyId = auth.user?.society_id;
  const queryClient = useQueryClient();

  const form = useForm<FlatFormValues>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      number: '',
      flat_type: 'TWO_BHK',
      owner_id: '',
      resident_id: '',
    },
  });

  const editForm = useForm<FlatFormValues>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      number: '',
      flat_type: 'TWO_BHK',
      owner_id: '',
      resident_id: '',
    },
  });

  useEffect(() => {
    if (societyId) {
      fetchFlats(societyId);
      fetchUsers(societyId);
    }
  }, [societyId]);

  useEffect(() => {
    if (selectedFlat) {
      console.log("Resetting form with selected flat:", selectedFlat);
      const residentId = selectedFlat.residents?.resident_id 
        ? String(selectedFlat.residents.resident_id) 
        : '';
      
      editForm.reset({
        number: selectedFlat.number,
        flat_type: selectedFlat.flat_type,
        owner_id: selectedFlat.owner_id ? String(selectedFlat.owner_id) : '',
        resident_id: residentId,
      });
    }
  }, [selectedFlat, editForm]);

  const fetchFlats = useCallback(async (societyId: number) => {
    try {
      const response = await apiRequest<ExtendedFlat[]>(`${ENDPOINTS.FLATS}/society/${societyId}`, 'GET');
      console.log("Fetched flats:", response);
      setFlats(response);
    } catch (error) {
      console.error('Error fetching flats:', error);
      toast.error('Failed to fetch flats');
    }
  }, []);

  const fetchUsers = useCallback(async (societyId: number) => {
    try {
      const response = await apiRequest<{ owners: any[]; residents: any[] }>(
        `${ENDPOINTS.USERS_BY_SOCIETY}/${societyId}`,
        'GET'
      );
      console.log("Fetched users:", response);
      setOwners(response.owners.map((owner: any) => ({ id: owner.id, fullname: owner.fullname })));
      setResidents(response.residents.map((resident: any) => ({ id: resident.id, fullname: resident.fullname })));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  }, []);

  const onSubmit = async (values: FlatFormValues) => {
    try {
      if (!societyId) {
        throw new Error('Society ID is missing.');
      }

      const newFlat = {
        ...values,
        society_id: societyId,
        owner_id: values.owner_id ? parseInt(values.owner_id) : null,
        resident_id: values.resident_id ? parseInt(values.resident_id) : null,
      };

      await apiRequest(ENDPOINTS.FLATS, 'POST', newFlat);
      await fetchFlats(societyId);
      queryClient.invalidateQueries({ queryKey: ['flats', societyId] });
      toast.success('Flat created successfully!');
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating flat:', error);
      toast.error('Failed to create flat');
    }
  };

  const handleEditFlat = async (values: any) => {
    try {
      const updatedFlat = {
        ...values,
        owner_id: values.owner_id ? parseInt(values.owner_id) : null,
        resident_id: values.resident_id ? parseInt(values.resident_id) : null,
        flat_type: values.flat_type || 'TWO_BHK',
      };

      if (!selectedFlat) {
        throw new Error('No flat selected for editing.');
      }

      console.log("Updating flat with values:", updatedFlat);
      await apiRequest(`${ENDPOINTS.FLATS}/${selectedFlat.id}`, 'PUT', updatedFlat);
      await fetchFlats(societyId!);
      queryClient.invalidateQueries({ queryKey: ['flats', societyId] });
      toast.success('Flat updated successfully!');
      setEditOpen(false);
      setSelectedFlat(null);
    } catch (error) {
      console.error('Error updating flat:', error);
      toast.error('Failed to update flat');
    }
  };

  const handleDeleteFlat = async (flatId: number) => {
    try {
      await apiRequest(`${ENDPOINTS.FLATS}/${flatId}`, 'DELETE');
      await fetchFlats(societyId!);
      queryClient.invalidateQueries({ queryKey: ['flats', societyId] });
      toast.success('Flat deleted successfully!');
    } catch (error) {
      console.error('Error deleting flat:', error);
      toast.error('Failed to delete flat');
    }
  };

  const getResidentName = (flat: ExtendedFlat) => {
    try {
      if (flat.residents && flat.residents.resident) {
        return flat.residents.resident.fullname;
      }
      return 'N/A';
    } catch (error) {
      ErrorLogger.log('Error getting resident name', 'error', error as Error);
      return 'N/A';
    }
  };

  const getResidentStatus = (flat: ExtendedFlat) => {
    try {
      if (flat.residents && flat.residents.resident) {
        return flat.residents.resident.status;
      }
      return null;
    } catch (error) {
      ErrorLogger.log('Error getting resident status', 'error', error as Error);
      return null;
    }
  };

  const getResidentDisplay = (flat: any) => {
    if (flat.residents && flat.residents.resident) {
      return flat.residents.resident.fullname || flat.residents.resident.email;
    }
    return "None";
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Manage Flats</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Flat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Flat</DialogTitle>
              <DialogDescription>
                Create a new flat in your society.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Flat 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flat_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a flat type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TWO_BHK">2BHK</SelectItem>
                          <SelectItem value="THREE_BHK">3BHK</SelectItem>
                          <SelectItem value="FOUR_BHK">4BHK</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="owner_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {owners.map((owner) => (
                            <SelectItem key={owner.id} value={String(owner.id)}>
                              {owner.fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resident_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resident</FormLabel>
                      <SelectWithEmptyValue onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resident (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {residents.map((resident) => (
                            <SelectItem key={resident.id} value={String(resident.id)}>
                              {resident.fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectWithEmptyValue>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flat Number</TableHead>
              <TableHead>Flat Type</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flats.map((flat) => (
              <TableRow key={flat.id}>
                <TableCell>{flat.number}</TableCell>
                <TableCell>{flat.flat_type}</TableCell>
                <TableCell>{flat.owner?.fullname || 'N/A'}</TableCell>
                <TableCell>{getResidentDisplay(flat)}</TableCell>
                <TableCell className="text-right">
                  <Dialog open={editOpen && selectedFlat?.id === flat.id} onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) setSelectedFlat(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedFlat(flat);
                        setEditOpen(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Flat</DialogTitle>
                        <DialogDescription>
                          Edit the details of the selected flat.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleEditFlat)} className="space-y-4">
                          <FormField
                            control={editForm.control}
                            name="number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Flat Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Flat 101" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="flat_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Flat Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a flat type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TWO_BHK">2BHK</SelectItem>
                                    <SelectItem value="THREE_BHK">3BHK</SelectItem>
                                    <SelectItem value="FOUR_BHK">4BHK</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="owner_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Owner</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an owner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {owners.map((owner) => (
                                      <SelectItem key={owner.id} value={String(owner.id)}>
                                        {owner.fullname}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="resident_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Resident</FormLabel>
                                <SelectWithEmptyValue onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a resident (optional)" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {residents.map((resident) => (
                                      <SelectItem key={resident.id} value={String(resident.id)}>
                                        {resident.fullname}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </SelectWithEmptyValue>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Update</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteFlat(flat.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FlatManagement;
