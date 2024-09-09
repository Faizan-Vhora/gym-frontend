'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
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
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';

export default function CustomerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const customerSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    password: id
      ? z.string().optional()
      : z
          .string()
          .min(1, { message: 'Password is required' })
          .min(6, { message: 'Password must be at least 6 characters long' }),
  });

  type CustomerFormInputs = z.infer<typeof customerSchema>;

  const {
    control,
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
        .catch((err: unknown) => {
          let errorMessage: string;
          if (typeof err === 'string') {
            errorMessage = err;
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
      setValue('password', customer.password);
    }
  }, [customer, setValue]);

  const onSubmit = async (data: CustomerFormInputs): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);
    const requestData = {
      ...data,
      userType: 3, // Replace 'someUserType' with the actual user type value
    };
    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/users/${id}` : '/users';

      await axiosInstance({
        method,
        url,
        data: requestData,
      });
      toast.success('Member saved successfully');
      router.push('/dashboard/customers'); // Redirect to the listing page after successful save
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message; // Safely access the message property
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
      setError('Failed to save Member details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!customer && id) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={id ? 'Edit Member' : 'Create Member'} />
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

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required={!id} // Make password field required only if there is no id
                  error={Boolean(errors.password)}
                >
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      showPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={() => {
                            setShowPassword(false);
                          }}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={() => {
                            setShowPassword(true);
                          }}
                        />
                      )
                    }
                  />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {id && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Phone Number</InputLabel>
                  <OutlinedInput
                    {...register('phoneNumber')}
                    label="Phone Number"
                    error={Boolean(errors.phoneNumber)}
                  />
                  {errors.phoneNumber && <FormHelperText>{errors.phoneNumber.message}</FormHelperText>}
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
              </>
            )}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit" disabled={isSubmitting}>
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
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
