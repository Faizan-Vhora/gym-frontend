'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify'; // Import toast for notification
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

const customerSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().min(1, 'Created Date is required'),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

export default function CustomerEditForm() {
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
          params: {
            userType: 3,
          },
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
        params: {
          userType: 3,
        },
      });
      toast.success('Customer updated successfully'); // Show success toast
      router.push('/dashboard/customers'); // Redirect to the listing page after successful update
    } catch (error) {
      toast.error('Failed to update customer'); // Show error toast
      console.error('Failed to update customer:', error);
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Edit Customer
      </Typography>
      <Stack spacing={3}>
        <TextField
          label="Full Name *"
          {...register('fullName')}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />
        <TextField
          label="Email *"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Phone Number"
          {...register('phoneNumber')}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message}
        />
        <TextField
          label="Address"
          {...register('address')}
          error={!!errors.address}
          helperText={errors.address?.message}
        />
        <TextField
          label="Created At"
          type="date"
          value={dayjs(customer.createdAt).format('YYYY-MM-DD')}
          InputProps={{ readOnly: true }}
          disabled={true}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button type="submit" variant="contained">
            Save
          </Button>
          <Button variant="outlined" onClick={() => router.push('/dashboard/customers')}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
