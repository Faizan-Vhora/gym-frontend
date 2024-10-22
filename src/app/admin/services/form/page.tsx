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
  Grid,
  IconButton,
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

import { CustomLoader } from '@/utils/loader';
import { Trash } from '@phosphor-icons/react';

import { Services } from '@/components/admin/services/service-table';

// Define validation schemas
const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  serviceImage: z.string().optional(),
  serviceImageUrl: z.string().optional(),
});

type ServiceFormInputs = z.infer<typeof ServiceSchema>;

export default function ServiceForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [services, setServices] = useState<ServiceFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormInputs>({
    resolver: zodResolver(ServiceSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosInstance
        .get<{ data: Services }>(`/service-management/${id}`)
        .then((response) => {
          const fetchedData: Services = response.data.data;
          setServices(fetchedData);
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          toast.error(errorMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (services) {
      setValue('title', services.title);
      setValue('description', services.description);
      setValue('serviceImage', services.serviceImage);
    }
  }, [services, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (): void => {
    setImagePreview(null);
    setImageFile(null);
  };

  const onSubmit = async (data: ServiceFormInputs): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    const formData = new FormData();

    const fields = [
      { key: 'title', value: data.title },
      { key: 'description', value: data.description },
      { key: 'serviceImage', value: imageFile }, // Ensure imageFile is properly set
    ];

    fields.forEach(({ key, value }): void => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/service-management/${id}` : '/service-management';

      await axiosInstance({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Service saved successfully');
      router.push('/admin/services');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      setError('Failed to save Service details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          title={id ? 'Edit Service' : 'Create Service'}
          subheader="Fill in the Service details"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <Card sx={{ marginBottom: '40px' }}>
                <CardContent>
                  <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <div>
                      <div style={{ position: 'relative', width: '100%', maxHeight: '200px', marginTop: '1rem' }}>
                        <img
                          src={imagePreview || '/assets/User@3x-1.png'}
                          alt="Profile Preview"
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                        />
                        {imagePreview && ( // Conditionally render IconButton
                          <IconButton
                            onClick={handleRemoveImage}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              color: 'white',
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              },
                            }}
                          >
                            {/* Add your icon here, for example: */}
                            <Trash />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button component="label" fullWidth variant="text">
                    Upload picture
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item md={6} xs={12} p={2}>
              <FormControl required fullWidth>
                <InputLabel htmlFor="title">Title</InputLabel>
                <OutlinedInput id="title" {...register('title')} label="Title" error={Boolean(errors.title)} />
                {errors.title?.message && <FormHelperText error>{errors.title.message}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <TextField
                  {...register('description')}
                  label="Description"
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit" disabled={isSubmitting}>
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/admin/services');
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
      {error && <Alert color="error">{error}</Alert>}
      <ToastContainer />
    </Box>
  );
}
