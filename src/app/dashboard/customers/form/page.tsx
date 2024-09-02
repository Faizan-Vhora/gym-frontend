'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

const customerSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().min(1, 'Created Date is required'),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

export default function CustomerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/users/${id}`, {
          params: { userType: 3 },
        })
        .then((response) => {
          setCustomer(response.data.data);
        })
        .catch((error) => {
          console.error('Failed to fetch customer:', error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (customer) {
      setValue('fullName', customer.fullName);
      setValue('email', customer.email);
      setValue('phoneNumber', customer.phoneNumber || '');
      setValue('address', customer.address || '');
      setValue('createdAt', customer.createdAt);
    }
  }, [customer, setValue]);

  const onSubmit = async (data: CustomerFormInputs) => {
    try {
      await axiosInstance.put(`/users/${id}`, data, {
        params: { userType: 3 },
      });
      toast.success('Customer updated successfully');
      router.push('/dashboard/customers');
    } catch (error) {
      toast.error('Failed to update customer');
      console.error('Failed to update customer:', error);
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardHeader title="Edit Customer" subheader="Update the customer details" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Full Name</InputLabel>
              <OutlinedInput {...register('fullName')} label="Full Name" error={!!errors.fullName} />
              {errors.fullName && <Typography color="error">{errors.fullName.message}</Typography>}
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Email</InputLabel>
              <OutlinedInput {...register('email')} label="Email" type="email" error={!!errors.email} />
              {errors.email && <Typography color="error">{errors.email.message}</Typography>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Phone Number</InputLabel>
              <OutlinedInput {...register('phoneNumber')} label="Phone Number" error={!!errors.phoneNumber} />
              {errors.phoneNumber && <Typography color="error">{errors.phoneNumber.message}</Typography>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Address</InputLabel>
              <OutlinedInput {...register('address')} label="Address" error={!!errors.address} />
              {errors.address && <Typography color="error">{errors.address.message}</Typography>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Created At</InputLabel>
              <OutlinedInput value={dayjs(customer.createdAt).format('YYYY-MM-DD')} label="Created At" disabled />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit">
            Save
          </Button>
          <Button  variant="outlined" onClick={() => router.push('/dashboard/customers')}
                         sx={{
                          borderColor: '#d0021b',
                          color: '#d0021b',
                          transform: 'skewX(-20deg)',
                          '&:hover': {
                            borderColor: 'darkred',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          },
                        }}>
              Cancel
            </Button>
        </CardActions>
      </Card>
      <ToastContainer />
    </Box>
  );
}
