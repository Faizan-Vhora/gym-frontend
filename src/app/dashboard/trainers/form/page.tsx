'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

const trainerSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().min(1, 'Created Date is required'),
});

type TrainerFormInputs = z.infer<typeof trainerSchema>;

export default function TrainerEditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerFormInputs | null>(null);

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
        .get(`/users/${id}`, {
          params: {
            userType: 3,
          },
        })
        .then((response) => {
          setTrainer(response.data.data);
        })
        .catch((error) => {
          console.error('Failed to fetch trainer:', error);
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

  const onSubmit = async (data: TrainerFormInputs) => {
    try {
      await axiosInstance.put(`/users/${id}`, data);
      router.push('/dashboard/trainers'); // Redirect to the listing page after successful update
    } catch (error) {
      console.error('Failed to update trainers:', error);
    }
  };

  if (!trainer) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Edit Trainer
      </Typography>
      <Stack spacing={3}>
        <TextField
          label="Full Name"
          {...register('fullName')}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />
        <TextField
          label="Email"
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
          value={dayjs(trainer.createdAt).format('YYYY-MM-DD')}
          InputProps={{ readOnly: true }}
          disabled={true}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button type="submit" variant="contained">
            Save
          </Button>
          <Button variant="outlined" onClick={() => router.push('/dashboard/trainers')}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
