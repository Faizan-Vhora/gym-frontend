'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';

// Define the schema for form validation
const ChangePasswordSchema = z
  .object({
    old_password: z
      .string()
      .min(1, { message: 'Old Password is required' })
      .min(6, { message: 'Old Password must be at least 6 characters long' }),
    new_password: z
      .string()
      .min(1, { message: 'New Password is required' })
      .min(6, { message: 'New Password must be at least 6 characters long' }),
    confirm_password: z
      .string()
      .min(1, { message: 'Confirmation is required' })
      .min(6, { message: 'Confirmation must be at least 6 characters long' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New password and confirmation must match',
    path: ['confirm_password'],
  });

type ChangePasswordFormInputs = z.infer<typeof ChangePasswordSchema>;

export function ChangePasswordForm(): React.JSX.Element {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showNewPassword, setNewShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setConfirmShowPassword] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onBlur',
  });

  interface ChangePasswordResponse {
    data: boolean;
  }

  const onSubmit = async (data: ChangePasswordFormInputs): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    try {
      // Call the API to change the password
      const response = await axiosInstance.post<ChangePasswordResponse>('/auth/change-password', {
        old_password: data.old_password,
        new_password: data.new_password,
      });

      if (response.data.data) {
        await axiosInstance.get('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin'); // Redirect to sign-in page after logging out
      } else {
        // Handle the case where the password change was not successful
        setError('Password change failed');
      }

      // Success message
      toast.success('Password changed successfully');
      router.push('/auth/sign-in'); // Redirect on success
    } catch (err: unknown) {
      setError('An error occurred while changing the password.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Change Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid item md={4}>
                <Controller
                  name="old_password"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={Boolean(errors.old_password)}>
                      <InputLabel>Old Password</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Old Password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <Box
                            component="span"
                            onClick={() => {
                              setShowPassword(!showPassword);
                            }}
                            sx={{ cursor: 'pointer', display: 'inline' }}
                          >
                            {showPassword ? <EyeIcon size={24} /> : <EyeSlashIcon size={24} />}
                          </Box>
                        }
                      />
                      {errors.old_password?.message && (
                        <FormHelperText error>{errors.old_password.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item md={4}>
                <Controller
                  name="new_password"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={Boolean(errors.new_password)}>
                      <InputLabel>New Password</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        endAdornment={
                          <Box
                            component="span"
                            onClick={() => {
                              setNewShowPassword(!showNewPassword);
                            }}
                            sx={{ cursor: 'pointer', display: 'inline' }}
                          >
                            {showNewPassword ? <EyeIcon size={24} /> : <EyeSlashIcon size={24} />}
                          </Box>
                        }
                      />
                      {errors.new_password?.message && (
                        <FormHelperText error>{errors.new_password.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item md={4}>
                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={Boolean(errors.confirm_password)}>
                      <InputLabel>Confirm Password</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        endAdornment={
                          <Box
                            component="span"
                            onClick={() => {
                              setConfirmShowPassword(!showConfirmPassword);
                            }}
                            sx={{ cursor: 'pointer', display: 'inline' }}
                          >
                            {showConfirmPassword ? <EyeIcon size={24} /> : <EyeSlashIcon size={24} />}
                          </Box>
                        }
                      />
                      {errors.confirm_password?.message && (
                        <FormHelperText error>{errors.confirm_password.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
          <Button className="common-button" type="submit" variant="contained" disabled={isSubmitting}>
            Change Password
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/dashboard');
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
        </Stack>
        {loading && <CustomLoader />}
        {error && <Alert color="error">{error}</Alert>}
      </Card>
      <ToastContainer />
    </Box>
  );
}
