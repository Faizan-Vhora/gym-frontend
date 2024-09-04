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

import type { Trainer } from '@/components/dashboard/trainer/trainer-table';

const trainerSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().min(1, 'Created Date is required'),
});

type TrainerFormInputs = z.infer<typeof trainerSchema>;

export default function TrainerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerFormInputs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrainerFormInputs>({
    resolver: zodResolver(trainerSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: Trainer }>(`/users/${id}`, {
          params: {
            userType: 3,
          },
        })
        .then((response) => {
          const fetchedData: Trainer = response.data.data;
          setTrainer(fetchedData);
        })
        .catch((err: unknown) => {
          let errorMessage: string;
          if (err instanceof Error) {
            errorMessage = err.message; // Safely access the message property
          } else {
            errorMessage = 'An unexpected error occurred'; // Fallback message
          }
          toast.error(errorMessage);
        });
    }
  }, [id]);

  useEffect(() => {
    if (trainer) {
      setValue('fullName', trainer.fullName);
      setValue('email', trainer.email);
      setValue('phoneNumber', trainer.phoneNumber || '');
      setValue('address', trainer.address || '');
      setValue('createdAt', trainer.createdAt);
    }
  }, [trainer, setValue]);

  const onSubmit = async (data: TrainerFormInputs): Promise<void> => {
    setError(null);

    try {
      await axiosInstance.put(`/users/${id}`, data, {
        params: {
          userType: 3,
        },
      });
      toast.success('Trainer updated successfully');
      router.push('/dashboard/trainers'); // Redirect to the listing page after successful update
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message; // Safely access the message property
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
      setError('Failed to update trainer details.');
    }
  };

  if (!trainer) {
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
              router.push('/dashboard/trainers');
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
      {error && <div className="error-message">{error}</div>}
      <ToastContainer />
    </Box>
  );
}
