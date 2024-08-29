'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { Duration, Status, TrainerEntry } from '@/components/dashboard/trainer-package/trainer-table';

interface EditTrainerFormProps {
  initialData?: TrainerEntry;
  onSave: (data: TrainerEntry) => void;
}

interface FormValues {
  id?: number;
  trainer_id: string;
  package_name: string;
  package_description: string;
  price: number;
  currency: string;
  duration: Duration;
  status: Status;
}

export default function EditTrainerForm({ initialData, onSave }: EditTrainerFormProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialData || {
      trainer_id: '',
      package_name: '',
      package_description: '',
      price: 0,
      currency: 'USD',
      duration: 'Per Hour',
      status: 'Active',
    },
  });
  const router = useRouter();

  const onSubmit = (data: FormValues) => {
    const newData: TrainerEntry = {
      ...data,
      id: initialData?.id || Date.now(),
    };
    onSave(newData);
    router.push('/dashboard/trainer');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" mb={2}>
        {initialData ? 'Edit Trainer' : 'Add New Trainer'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="trainer_id"
            control={control}
            rules={{ required: 'Trainer ID is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Trainer ID"
                variant="outlined"
                fullWidth
                error={!!errors.trainer_id}
                helperText={errors.trainer_id?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="package_name"
            control={control}
            rules={{ required: 'Package Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Package Name"
                variant="outlined"
                fullWidth
                error={!!errors.package_name}
                helperText={errors.package_name?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="package_description"
            control={control}
            rules={{ required: 'Package Description is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Package Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                error={!!errors.package_description}
                helperText={errors.package_description?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="price"
            control={control}
            rules={{ required: 'Price is required', min: { value: 0, message: 'Price must be positive' } }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Price"
                variant="outlined"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="currency"
            control={control}
            rules={{ required: 'Currency is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Currency"
                variant="outlined"
                fullWidth
                error={!!errors.currency}
                helperText={errors.currency?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="duration"
            control={control}
            rules={{ required: 'Duration is required' }}
            render={({ field }) => (
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select {...field} label="Duration" error={!!errors.duration}>
                  <MenuItem value="Per Hour">Per Hour</MenuItem>
                  <MenuItem value="Per Day">Per Day</MenuItem>
                  <MenuItem value="Per Week">Per Week</MenuItem>
                  <MenuItem value="Per Month">Per Month</MenuItem>
                  <MenuItem value="Per Year">Per Year</MenuItem>
                </Select>
                {errors.duration && <Typography color="error">{errors.duration.message}</Typography>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status" error={!!errors.status}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
                {errors.status && <Typography color="error">{errors.status.message}</Typography>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Save Changes' : 'Add Trainer'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
