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
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
} from '@mui/material';
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
  // createdAt: z.string().min(1, 'Created Date is required'),
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
        .get<{ data: CustomerFormInputs }>(`/users/${id}`, {
          params: { userType: 3 },
        })
        .then((response) => {
          setCustomer(response.data.data);
        })
        .catch((error: unknown) => {
          let errorMessage: string;
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            // Handle other types of errors, or set a generic message
            errorMessage = 'An unexpected error occurred';
          }
          // Convert the Error object to a string
          toast.error(errorMessage);
        });
    }
  }, [id]);

  useEffect(() => {
    if (customer) {
      setValue('fullName', customer.fullName);
      setValue('email', customer.email);
      setValue('phoneNumber', customer.phoneNumber || '');
      setValue('address', customer.address || '');
      // setValue('createdAt', customer.createdAt);
    }
  }, [customer, setValue]);

  const onSubmit = async (data: CustomerFormInputs): Promise<void> => {
    try {
      await axiosInstance.put(`/users/${id}`, data, {
        params: { userType: 3 },
      });
      toast.success('Member updated successfully');
      router.push('/dashboard/customers');
    } catch (error: unknown) {
      toast.error('Failed to update member');
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="Edit Member" subheader="Update the Member details" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Full Name</InputLabel>
              <OutlinedInput {...register('fullName')} label="Full Name" error={Boolean(errors.fullName)} />

              {errors.fullName ? <FormHelperText>{errors.fullName.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Email</InputLabel>
              <OutlinedInput {...register('email')} label="Email" type="email" error={Boolean(errors.email)} />
              {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Phone Number</InputLabel>
              <OutlinedInput {...register('phoneNumber')} label="Phone Number" error={Boolean(errors.phoneNumber)} />
              {errors.phoneNumber ? <FormHelperText>{errors.phoneNumber.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth>
              <TextField
                {...register('address')}
                label="Address"
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
                multiline
                rows={4} // Increase the number of rows here
                variant="outlined"
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit">
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/dashboard/customers');
            }}
            sx={{
              borderColor: '#d0021b',
              color: '#d0021b',
              transform: 'skewX(-20deg)',
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
      <ToastContainer />
    </Box>
  );
}
