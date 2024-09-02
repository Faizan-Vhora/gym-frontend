'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z as zod } from 'zod';

import 'react-toastify/dist/ReactToastify.css';

import { paths } from '@/paths';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/auth-context'; // Import the custom hook

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: 'admin@gmail.com', password: '12345678' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { state, dispatch } = useAuth(); // Get state and dispatch from context
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true); // Set pending state
      setError(null); // Clear previous errors

      try {
        const response = await axiosInstance.post('/auth/login', values);

        // Store the token and user in global state using the reducer
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: response.data.data.access_token.token,
            user: response.data.data.user,
          },
        });

        // Store the token in localStorage (optional if you need persistence)
        localStorage.setItem('token', response.data.data.access_token.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Show a success toast message
        toast.success('Logged in successfully!');

        // Redirect to the dashboard
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Login error:', error);
        setError(error?.response?.data?.message || error.message);
        dispatch({
          type: 'LOGOUT',
        });
      } finally {
        setIsPending(false); // Clear pending state
      }
    },
    [router, dispatch]
  );

  return (
    <Stack spacing={4}>
      {/* <ToastContainer /> */}
      <Stack spacing={1}>
        <Typography variant="h4" style={{ fontFamily: 'Audiowide', fontWeight: 400, fontStyle: 'normal' }}>
          Sign in
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href={paths.auth.forgotPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {error ? <Alert color="error">{error}</Alert> : null}
          <Button className="common-button" disabled={isPending} type="submit" variant="contained">
            Sign in
          </Button>
        </Stack>
      </form>
      <ToastContainer />
    </Stack>
  );
}
