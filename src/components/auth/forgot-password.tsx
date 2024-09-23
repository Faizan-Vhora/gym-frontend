'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
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

import 'react-toastify/dist/ReactToastify.css';

import { Alert, CardActions } from '@mui/material';

import axiosInstance from '@/lib/axios';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      try {
        // Add usertype = 1 to the values object
        const updatedValues = {
          ...values,
          userType: 1, // Set usertype to 1
        };

        const response = await axiosInstance.post('/auth/forgot-password', updatedValues);

        if (response.status === 201) {
          toast.success('Mail sent successfully');
        }
      } catch (err: unknown) {
        // Handle server-side or network errors
        setFormError('root', { type: 'server', message: 'Failed to send mail. Please try again later.' });
      } finally {
        setIsPending(false);
      }
    },
    [setFormError, router]
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Forget Password</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button className="common-button" disabled={isPending} type="submit" variant="contained">
              {isPending ? 'Sending...' : 'Send Recovery Link'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                router.push('/auth/sign-in');
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
              Back
            </Button>
          </CardActions>
        </Stack>
      </form>

      <ToastContainer />
    </Stack>
  );
}
