'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { useRouter, useSearchParams } from 'next/navigation';
import { DateFormat } from '@/utils/constant';
import { formatTime } from '@/utils/date-utils';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import { CheckInEntry } from '@/components/dashboard/check-in/check-in-table';
import { Customer } from '@/components/dashboard/customer/customers-table';
import { Trainer } from '@/components/dashboard/trainer/trainer-table';

// Define the form schema using zod
const checkinSchema = z
  .object({
    userId: z.number().min(1, 'User is required'),
    entryDate: z.date().refine((date) => !isNaN(date.getTime()), {
      message: 'Entry date is required',
    }),
    entryInTime: z.date().refine((time) => !isNaN(time.getTime()), {
      message: 'Entry in time is required',
    }),
    entryOutTime: z.date().nullable(),
  })
  .superRefine((data, ctx) => {
    const { entryInTime, entryOutTime } = data;

    // Check if entryOutTime is provided and is greater than entryInTime
    if (entryOutTime && entryInTime && entryOutTime < entryInTime) {
      ctx.addIssue({
        path: ['entryOutTime'],
        code: z.ZodIssueCode.custom,
        message: 'Entry out time must not be greater than entry in time',
      });
    }
  });

const CheckinForm = () => {
  const [tabValue, setTabValue] = useState<'member' | 'trainer'>('member');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fetchedCheckIn, setFetchedCheckIn] = useState<CheckInEntry>();
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkInId = searchParams.get('id'); // Get check-in ID from URL

  // Use react-hook-form with zod validation
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      userId: '',
      entryDate: null as Date | null,
      entryInTime: null as Date | null,
      entryOutTime: null as Date | null,
    },
  });

  interface ApiResponse<T> {
    data: T;
  }

  // Update fetchUsers with return type
  const fetchUsers = async <T extends Trainer[] | Customer[]>(userType: 'trainer' | 'customer'): Promise<T> => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(`/users/${userType}/dropdown`);
      return response.data.data; // Type-safe return
    } catch (error) {
      toast.error(`Failed to load ${userType}s.`);
      return [] as unknown as T; // Return an empty array of the correct type
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userType: 'trainer' | 'customer' = tabValue === 'member' ? 'customer' : 'trainer';

      // Call fetchUsers with appropriate type
      if (userType === 'trainer') {
        const users = await fetchUsers<Trainer[]>(userType); // Explicitly pass Trainer[] as the expected type
        setTrainers(users);
      } else {
        const users = await fetchUsers<Customer[]>(userType); // Explicitly pass Customer[] as the expected type
        setCustomers(users);
      }
    };
    void fetchData();
  }, [tabValue]);

  // Fetch existing check-in data if an ID is present
  useEffect(() => {
    if (checkInId) {
      void fetchCheckInById(checkInId);
    }
  }, [checkInId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'member' | 'trainer') => {
    setTabValue(newValue);
    reset();
  };

  const fetchCheckInById = async (id: string) => {
    try {
      const response = await axiosInstance.get<{ data: CheckInEntry }>(`/entry-logs/${id}`);
      const checkInData: CheckInEntry = response.data.data;
      setFetchedCheckIn(checkInData);

      // Set the tab based on userType
      const userType = checkInData.user.userType;

      if (userType === 3) {
        setTabValue('member'); // Assuming 1 is for members
      } else if (userType === 2) {
        setTabValue('trainer'); // Assuming 2 is for trainers
      } else {
        setTabValue('member'); // Default case or handle appropriately
      }

      reset({
        userId: checkInData.user ? checkInData.user.id : '', // Adjust according to actual structure
        entryDate: checkInData.entryDate ? new Date(checkInData.entryDate) : null,
        entryInTime: checkInData.entryInTime ? new Date(`1970-01-01T${checkInData.entryInTime}`) : null, // Convert to Date object
        entryOutTime: checkInData.entryOutTime ? new Date(`1970-01-01T${checkInData.entryOutTime}`) : null, // Convert to Date object
      });
    } catch (error) {
      toast.error('Failed to fetch check-in details.');
    }
  };

  interface EntryFormData {
    userId: string; // Assuming userId is a string from the form input
    entryDate: Date | null; // Assuming entryDate is a string in a recognizable date format
    entryInTime: Date | null; // Assuming entryInTime is a string (e.g., time in HH:mm format)
    entryOutTime?: Date | null; // entryOutTime is optional and should be a string if present
  }

  const onSubmit = async (data: EntryFormData) => {
    const payload = {
      user: parseInt(data.userId),
      entryDate: dayjs(data.entryDate).format(DateFormat.dateFormat),
      entryInTime: formatTime(data.entryInTime),
      entryOutTime: data.entryOutTime ? formatTime(data.entryOutTime) : null,
    };

    try {
      if (checkInId) {
        // If checkInId exists, update the existing check-in
        await axiosInstance.put(`/entry-logs/${checkInId}`, payload);
        toast.success('Check-in successfully updated!');
      } else {
        // Otherwise, create a new check-in
        await axiosInstance.post('/entry-logs', payload);
        toast.success('Check-in successfully recorded!');
      }
      router.push('/dashboard/check-in');
      reset();
    } catch (error) {
      toast.error('Failed to record check-in.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <Stack margin={5}>
          {!fetchedCheckIn?.user && (
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Member Check-in" value="member" />
              <Tab label="Trainer Check-in" value="trainer" />
            </Tabs>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '20px' }}>
            <Grid container spacing={3}>
              <Grid item md={3} sm={6} xs={12}>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>User</InputLabel>
                      <Select {...field} label="User" disabled={Boolean(fetchedCheckIn?.user)}>
                        {loadingUsers ? (
                          <MenuItem disabled>Loading users...</MenuItem>
                        ) : (
                          (tabValue === 'member' ? customers : trainers).map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.fullName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.userId && <FormHelperText error>{errors.userId.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item md={3} sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <FormControl fullWidth required>
                    <Controller
                      name="entryDate"
                      control={control}
                      render={({ field, fieldState }) => (
                        <DatePicker
                          disableFuture
                          format="MM-DD-YYYY"
                          views={['year', 'month', 'day']}
                          label="Entry Date"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue: Dayjs | null) => {
                            if (newValue) {
                              field.onChange(newValue.toDate());
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(fieldState.error),
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </LocalizationProvider>
              </Grid>

              <Grid item md={3} sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <FormControl fullWidth required>
                    <Controller
                      name="entryInTime"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="Entry In Time"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue: Dayjs | null) => {
                            if (newValue) {
                              field.onChange(newValue.toDate());
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(fieldState.error),
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </LocalizationProvider>
              </Grid>

              <Grid item md={3} sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <FormControl fullWidth>
                    <Controller
                      name="entryOutTime"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TimePicker
                          label="Entry Out Time"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue: Dayjs | null) => {
                            if (newValue) {
                              field.onChange(newValue.toDate());
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(fieldState.error),
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" className="common-button" style={{fontFamily:'Audiowide, sans-serif !important',}}>
                  {checkInId ? 'Update Check-in' : 'Add Check-in'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push('/dashboard/check-in');
                  }}
                  sx={{
                    borderColor: '#d0021b',
                    color: '#d0021b',
                    marginLeft: '15px',
                    fontFamily:'Audiowide, sans-serif !important',
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
};

export default CheckinForm;
