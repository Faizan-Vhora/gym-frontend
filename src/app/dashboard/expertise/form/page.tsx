'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { z, ZodError } from 'zod';
import type {SelectChangeEvent}from '@mui/material';

import axiosInstance from '@/lib/axios';

const expertiseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.enum(['active', 'inactive'], { required_error: 'Status is required' }),
});

interface ExpertiseEntry {
  id?: number;
  title: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
}

export default function ExpertiseForm(): React.JSX.Element {
  const [expertise, setExpertise] = React.useState<ExpertiseEntry>({
    title: '',
    status: 'active',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof ExpertiseEntry, string[]>>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertiseId = searchParams.get('id');

  React.useEffect(() => {
    if (expertiseId) {
      axiosInstance
        .get(`/expertise/${expertiseId}`)
        .then((response) => {
          setExpertise(response.data.data);
        })
        .catch((error) => {console.error('Error fetching expertise:', error)});
    }
  }, [expertiseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpertise((prevExpertise) => ({
      ...prevExpertise,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setExpertise((prevExpertise) => ({
      ...prevExpertise,
      [name as string]: value as string,
    }));
  };

  const validate = (): boolean => {
    try {
      expertiseSchema.parse(expertise);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof ZodError) {
        const formattedErrors = Object.fromEntries(
          Object.entries(e.format()).map(([key, value]) => [
            key,
            value as string[], // Cast the value to string[]
          ])
        );
        setErrors(formattedErrors as Partial<Record<keyof ExpertiseEntry, string[]>>);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const method = expertise.id ? 'put' : 'post';
      const url = expertise.id ? `/expertise/${expertise.id}` : '/expertise';

      await axiosInstance({
        method: method,
        url: url,
        data: expertise,
      });

      router.replace('/dashboard/expertise');
    } catch (error) {
      console.error('Error saving expertise:', error);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{expertise.id ? 'Edit Expertise' : 'Create Expertise'}</Typography>

      <TextField
        label="Title"
        name="title"
        value={expertise.title}
        onChange={handleInputChange}
        fullWidth
        error={Boolean(errors.title)}
        helperText={errors.title?.[0]}
      />

      <Select
        label="Status"
        name="status"
        value={expertise.status}
        onChange={handleSelectChange}
        fullWidth
        error={Boolean(errors.status)}
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </Select>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button className="common-button" type="submit" variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            router.push('/dashboard/discount');
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
    </Stack>
  );
}
