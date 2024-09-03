'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z as zod } from 'zod';

import axiosInstance from '@/lib/axios';

const schema = zod
  .object({
    password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type Values = zod.infer<typeof schema>;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = React.useState<boolean | null>(null); // null represents loading state
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Retrieve the token from URL search params
  const router = useRouter();

  React.useEffect(() => {
    // Check the token validity when the component mounts
    const validateToken = async (): Promise<void> => {
      if (!token) {
        setError('Invalid token');
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await axiosInstance.post('/auth/check-reset-password-token', { token });
        if (response.status === 201 && response.data?.data) {
          setIsTokenValid(true);
        } else {
          setError('The link has expired. Please try again.');
          setIsTokenValid(false);
        }
      } catch (err) {
        setError('Failed to validate token. Please try again later.');
        setIsTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const {
    control,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      if (!token) {
        setError('Token not found in URL');
        return;
      }

      setIsPending(true);
      setError(null); // Clear previous errors

      try {
        // Make the API call to reset the password
        const response = await axiosInstance.post('/auth/reset-password', {
          password: values.password,
          token, // Include the token in the payload
        });

        if (response.status === 201) {
          toast.success('Password reset successfully');
          router.push('/auth/sign-in'); // Redirect to sign-in page
        }
      } catch (err: any) {
        // Handle server-side or network errors
        setFormError('root', { type: 'server', message: 'Failed to reset password. Please try again later.' });
      } finally {
        setIsPending(false);
      }
    },
    [token, setFormError, router]
  );

  if (isTokenValid === null) {
    return <Typography>Loading...</Typography>; // Loading state
  }

  if (!isTokenValid) {
    return (
      <Stack spacing={4}>
        <Alert color="error">{error || 'The link has expired. Please try again.'}</Alert>
        <Button onClick={() => router.push('/auth/sign-in')} variant="contained">
          Go to Sign In
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Reset Password</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput {...field} label="Password" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.confirmPassword)}>
                <InputLabel>Confirm Password</InputLabel>
                <OutlinedInput {...field} label="Confirm Password" type="password" />
                {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button className="common-button" disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Stack>
      </form>
      <ToastContainer />
    </Stack>
  );
}
