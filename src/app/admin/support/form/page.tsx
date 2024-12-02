'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { SUPPORT_TICKET_STATUS_OPTIONS, SUPPORT_TICKET_USER_TYPE_OPTIONS, USER_TYPE } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import { Customer } from '@/components/admin/customer/customers-table';
import { SupportEntry } from '@/components/admin/support/support-table';
import { Trainer } from '@/components/admin/trainer/trainer-table';

import MessageForm from '../messages/page';

// Dynamically import the CKEditor
const CustomEditor = dynamic(() => import('@/components/ckeditor'), { ssr: false });

export interface SupportTicketPayloadDataI {
  subject: string;
  userType: number;
  user: number;
  status: string;
  description: string;
}

// Define validation schemas
const supportSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  userType: z.string().min(1, 'User Type is required'),
  user: z.string().min(1, 'User is required'),
  status: z.string().min(1, 'Status is required'),
  description: z.string().optional(),
});

type SupportFormInputs = z.infer<typeof supportSchema>;

interface UserOption {
  value: string;
  label: string;
}

export default function SupportForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  // Form fields
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [description, setTicketDescription] = useState<string>('');
  const [supportTicket, setSupportTicket] = useState<SupportFormInputs | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [subjectData, setSubjectData] = useState<string>('');
  const [userTypeData, setUserTypeData] = useState<string>('');
  const [statusData, setStatusData] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState<string>(id ? 'message' : 'edit');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<SupportFormInputs>({
    resolver: zodResolver(supportSchema),
    mode: 'onBlur',
  });

  const userType = watch('userType', '');
  const status = watch('status', '');

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosInstance
        .get<{ data: SupportEntry }>(`/support-ticket/${id}`)
        .then((response) => {
          const fetchedData: SupportEntry = response.data.data;
          setSupportTicket({
            subject: fetchedData.subject,
            userType: String(fetchedData.userType),
            user: fetchedData.user ? String(fetchedData.user.id) : '',
            status: fetchedData.status,
          });
          setTicketDescription(fetchedData.description);
          setSubjectData(fetchedData.subject);
          setUserTypeData(String(fetchedData.userType));
          setStatusData(fetchedData.status);
          setSelectedUser({
            label: `${fetchedData?.user?.memberId} | ${fetchedData?.user?.fullName} | ${fetchedData?.user?.email}`, // Assuming 'name' is a field in your user data
            value: String(fetchedData?.user?.id), // Assuming 'id' is the unique identifier for the user
          });
        })
        .catch((err: unknown) => {
          err instanceof Error ? err.message : 'An unexpected error occurred';
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (supportTicket) {
      setValue('subject', supportTicket.subject);
      setValue('userType', supportTicket.userType);
      setValue('user', supportTicket.user);
      setValue('status', supportTicket.status);
    }
    if (subjectData) {
      setValue('subject', subjectData); // Dynamically set the subject
    }
    if (userTypeData) {
      setValue('userType', userTypeData); // Dynamically set the subject
    }
    if (statusData) {
      setValue('status', statusData); // Dynamically set the subject
    }
  }, [subjectData, userTypeData, statusData, supportTicket, setValue]);

  useEffect(() => {
    const updatedUserOptions =
      userType === String(USER_TYPE.MEMBER)
        ? customers.map((customer) => ({
            value: customer.id.toString(), // Ensure `id` is a string for consistency
            label: `${customer.memberId} | ${customer.fullName} | ${customer.email}`,
          }))
        : trainers.map((trainer) => ({
            value: trainer.id.toString(),
            label: `${trainer.memberId} | ${trainer.fullName} | ${trainer.email}`,
          }));

    setUserOptions(updatedUserOptions);
    // if (!id) {
    //   setValue('user', '');
    // }
  }, [userType, customers, trainers]);

  const fetchTrainers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ data: Trainer[] }>('/users/trainer/dropdown');
      setTrainers(response.data.data);
    } catch (err) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  };

  React.useEffect(() => {
    if (searchParams.get('tab')) {
      setTabValue(String(searchParams.get('tab')));
    }
  }, []);

  React.useEffect(() => {
    if (id && tabValue) {
      router.push(`/admin/support/form?id=${id}&tab=${tabValue}`);
    }
    if (subjectData) {
      setValue('subject', subjectData); // Dynamically set the subject
    }
    if (userTypeData) {
      setValue('userType', userTypeData); // Dynamically set the subject
    }
    if (statusData) {
      setValue('status', statusData); // Dynamically set the subject
    }
  }, [id, tabValue]);

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ data: Customer[] }>('/users/customer/dropdown');
      setCustomers(response.data.data);
    } catch (err) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  };

  const onSubmit = async (formData: SupportFormInputs): Promise<void> => {
    formData.description = description;
    setIsSubmitting(true);
    setError(null);
    setLoading(true);
    if (!selectedUser) {
      toast.error('Error: No user selected!');
      setIsSubmitting(false);
      setLoading(false);
      return; // Exit the function early
    }
    const selectedOption = userOptions.find((option) => option.value === formData.user);
    setSelectedUser(selectedOption || null);

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/support-ticket/${id}` : '/support-ticket';

      const data: SupportTicketPayloadDataI = {
        subject: formData.subject,
        userType: parseInt(formData.userType),
        user: parseInt(formData.user),
        status: formData.status,
        description: formData.description,
      };

      await axiosInstance({
        method,
        url,
        data,
      });
      toast.success('Support ticket saved successfully');
      // router.push('/admin/support');
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
      setError('Failed to save support ticket details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'edit' | 'message') => {
    setTabValue(newValue);
    reset();
  };

  useEffect(() => {
    void fetchTrainers();
    void fetchCustomers();
  }, []);

  if (!supportTicket && id) {
    return <div>{loading && <CustomLoader />}</div>;
  }

  return (
    <>
      <Stack margin={2}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          {id && <Tab label="Message" value="message" />}
          <Tab label="Edit Support Ticket" value="edit" />
        </Tabs>
      </Stack>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        {tabValue === 'edit' && (
          <Card>
            <CardHeader
              style={{ fontFamily: '"Audiowide", sans-serif' }}
              title={id ? 'Edit Support Ticket' : 'Create Support Ticket'}
              sx={{ backgroundColor: '#f5f5f5', py: 2 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4} sm={6}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.userType)}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      {...register('userType')}
                      value={userType || supportTicket?.userType}
                      onChange={(e) => {
                        setSelectedUser(null);
                        setValue('userType', e.target.value);
                      }}
                      label="User Type"
                    >
                      {SUPPORT_TICKET_USER_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.userType && (
                      <Typography color="error" variant="caption">
                        {errors.userType.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4} sm={6}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.status)}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...register('status')}
                      value={status || supportTicket?.status}
                      onChange={(e) => {
                        setValue('status', e.target.value);
                      }}
                      label="Status"
                    >
                      {SUPPORT_TICKET_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <Typography color="error" variant="caption">
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4} sm={12}>
                  <FormControl fullWidth variant="outlined" required error={Boolean(errors.user)}>
                    <Autocomplete
                      options={userOptions}
                      getOptionLabel={(option) => option.label}
                      value={selectedUser}
                      onChange={(event, newValue) => {
                        setSelectedUser(newValue);
                        setValue('user', newValue?.value || ''); // Handle null case
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="User"
                          variant="outlined"
                          error={Boolean(errors.user)}
                          helperText={errors.user?.message}
                        />
                      )}
                    />
                  </FormControl>
                  {/* <FormControl fullWidth variant="outlined" required error={Boolean(errors.user)}>
                    <InputLabel>User</InputLabel>
                    <Select
                      {...register('user')}
                      value={selectedUser}
                      onChange={(e) => {
                        setValue('user', e.target.value);
                      }}
                      label="User"
                    >
                      {userOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.user && (
                      <Typography color="error" variant="caption">
                        {errors.user.message}
                      </Typography>
                    )}
                  </FormControl> */}
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required error={Boolean(errors.subject)}>
                    <InputLabel>Subject</InputLabel>
                    <OutlinedInput {...register('subject')} label="Subject" />
                    {errors.subject && (
                      <Typography color="error" variant="caption">
                        {errors.subject.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <InputLabel required>Description</InputLabel>
                  <FormControl fullWidth required>
                    <CustomEditor
                      data={description}
                      onChange={(data) => {
                        setTicketDescription(data);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                className="common-button"
                variant="contained"
                type="submit"
                sx={{ mr: 2 }}
                disabled={isSubmitting}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  router.back();
                }}
                sx={{
                  borderColor: '#d0021b',
                  color: '#d0021b',
                  '&:hover': {
                    borderColor: 'darkred',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
            </CardActions>
          </Card>
        )}
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
        <ToastContainer />
      </Box>
      {id && tabValue === 'message' && <MessageForm />}
    </>
  );
}
