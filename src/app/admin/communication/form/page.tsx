'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { REGEX_VALIDATION } from '@/utils/constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import { Customer, Trainer } from '@/components/admin/calendar/types';

// Dynamically import the CustomEditor component with SSR disabled
const CustomEditor = dynamic(() => import('@/components/ckeditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const NotificationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .regex(REGEX_VALIDATION.QUESTION, 'Title must not contain special characters or numbers'),
  message: z.string().min(1, 'Message is Required'),
  userIds: z.array(z.number()),
  sendToAll: z.boolean(),
});

type NotificationFormData = z.infer<typeof NotificationSchema>;

export default function NotificationForm() {
  const [tabValue, setTabValue] = useState<'member' | 'trainer'>('member');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(NotificationSchema),
    defaultValues: {
      title: '',
      message: '',
      userIds: [],
      sendToAll: false,
    },
  });

  const sendToAll = watch('sendToAll');

  interface ApiResponse<T> {
    data: T;
  }

  const fetchUsers = async <T extends Trainer[] | Customer[]>(userType: 'trainer' | 'customer'): Promise<T> => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(`/users/${userType}/dropdown`);
      return response.data.data;
    } catch (error) {
      toast.error(`Failed to load ${userType}s.`);
      return [] as unknown as T;
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userType = tabValue === 'member' ? 'customer' : 'trainer';
      const users = await fetchUsers(userType);
      if (userType === 'trainer') {
        setTrainers(users as Trainer[]);
      } else {
        setCustomers(users as Customer[]);
      }
    };
    void fetchData();
  }, [tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'member' | 'trainer') => {
    setTabValue(newValue);
    reset({ title: '', message: '', userIds: [], sendToAll: false });
  };

  interface NotificationPayload {
    title: string;
    message: string;
    toAllMember?: boolean;
    toAllTrainer?: boolean;
    memberIds?: number[];
    trainerIds?: number[];
  }

  const onSubmit = async (data: NotificationFormData) => {
    const payload: NotificationPayload = {
      title: data.title,
      message: data.message,
    };

    if (data.sendToAll) {
      payload[tabValue === 'member' ? 'toAllMember' : 'toAllTrainer'] = true;
    } else {
      payload[tabValue === 'member' ? 'memberIds' : 'trainerIds'] = data.userIds;
    }
    try {
      await axiosInstance.post('/admin-notification', payload);
      toast.success('Notification sent successfully!');
      router.push('/admin/notification');
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
    }
  };

  const options = tabValue === 'member' ? customers : trainers;

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <Stack margin={5}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Member Communication" value="member" />
            <Tab label="Trainer Communication" value="trainer" />
          </Tabs>

          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '20px' }}>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                <Controller
                  name="sendToAll"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.checked) {
                              setValue('userIds', []);
                            }
                          }}
                        />
                      }
                      label={`Send to All ${tabValue === 'member' ? 'Members' : 'Trainers'}`}
                    />
                  )}
                />
              </Grid>
              {!sendToAll && (
                <Grid item sm={6} xs={12}>
                  <Controller
                    name="userIds"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <FormControl fullWidth variant="outlined">
                        <Autocomplete
                          multiple
                          options={options}
                          getOptionLabel={(option) => `${option.memberId} | ${option.fullName} | ${option.email}`} // Display the user's fullName
                          onChange={(event, newValue) => {
                            // Map the selected users to their ids
                            onChange(newValue.map((user) => user.id));
                          }}
                          value={options.filter((user) => value?.includes(user.id))} // Filter options based on selected user IDs
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="User"
                              variant="outlined"
                              error={Boolean(errors.userIds)}
                              helperText={errors.userIds ? errors.userIds.message : ''}
                              inputRef={ref} // Attach ref for react-hook-form
                            />
                          )}
                          loading={loadingUsers} // Show loading spinner
                          noOptionsText="No users found" // Text when no options match
                        />
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
              <Grid item sm={6} xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      required
                      error={Boolean(errors.title)}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <InputLabel>Message</InputLabel>
                <FormControl fullWidth required error={Boolean(errors.message)}>
                  <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                      <CustomEditor
                        data={field.value}
                        onChange={(data) => {
                          field.onChange(data);
                        }}
                      />
                    )}
                  />
                  {errors.message && <FormHelperText>{errors.message.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" className="common-button">
                  Send Notification
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push('/admin/notification');
                  }}
                  sx={{
                    borderColor: '#d0021b',
                    color: '#d0021b',
                    marginLeft: '15px',
                    transform: 'skewX(-20deg)',
                    '&:hover': {
                      borderColor: 'darkred',
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    },
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Stack>
      </Card>
      <ToastContainer />
    </Box>
  );
}
