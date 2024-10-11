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
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import { Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { Trainer } from '@/components/dashboard/trainer/trainer-table';

export default function TrainerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [redirectTo, setRedirectTo] = useState<'trainers' | 'profile-detail'>('trainers');

  const trainerSchema = z.object({
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
    profileImage: z.string().optional(),
    profileImageUrl: z.string().optional(), // Update field name
    gender: z.string().optional(), // Add gender field
    zipCode: z.string().optional(), // Add zipcode field
    qrCodeImageUrl: z.string().optional(),
    dateOfBirth: z.string().optional(),
  });

  type TrainerFormInputs = z.infer<typeof trainerSchema>;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrainerFormInputs>({
    resolver: zodResolver(trainerSchema),
    mode: 'onBlur',
  });

  interface TrainerData {
    data: Trainer;
  }

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: TrainerFormInputs }>(`/users/${id}`, {
          params: { userType: 3 },
        })
        .then((response) => {
          setTrainer(response.data.data);
        })
        .catch((err: unknown) => {
          let errorMessage: string;
          if (typeof err === 'string') {
            errorMessage = err;
          } else {
            errorMessage = 'An unexpected error occurred';
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
      setValue('password', trainer.password);
      setImagePreview(trainer.profileImageUrl || '');
      setValue('gender', trainer.gender || '');
      setValue('zipCode', trainer.zipCode || '');
      setValue('qrCodeImageUrl', trainer.qrCodeImageUrl || '');
      setValue('dateOfBirth', trainer.dateOfBirth || '');
    }
  }, [trainer, setValue]);

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

  const onSubmit = async (data: TrainerFormInputs, destination: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    const formData = new FormData();

    const fields = [
      { key: 'fullName', value: data.fullName },
      { key: 'email', value: data.email },
      { key: 'phoneNumber', value: data.phoneNumber },
      { key: 'address', value: data.address },
      { key: 'userType', value: '2' }, // Static value
      { key: 'zipCode', value: data.zipCode },
      { key: 'gender', value: data.gender },
      { key: 'password', value: data.password },
      { key: 'profileImage', value: imageFile }, // Ensure imageFile is properly set
      { key: 'dateOfBirth', value: data.dateOfBirth ? dayjs(data.dateOfBirth).format('YYYY-MM-DD') : '' }, // Convert Date to YYYY-MM-DD
    ];

    fields.forEach(({ key, value }) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/users/${id}` : '/users';

      const response: { data: TrainerData } = await axiosInstance({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Trainer saved successfully');

      if (destination === 'trainers') {
        router.push('/dashboard/trainers');
      } else if (destination === 'profile-detail') {
        router.push(`/dashboard/trainers/form/profile-details?id=${response?.data?.data?.id}`);
      }
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
      setError('Failed to save Trainer details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  if (!trainer && id) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, redirectTo))}>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Additional Details" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Grid container spacing={10}>
              {id && (
                <Grid item md={4} xs={12}>
                  <Card>
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
              )}
              <Grid item md={8} xs={12} marginTop={5} marginLeft={id ? 0 : 2}>
                <Grid container spacing={4}>
                  {id && (
                    <>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth>
                          <InputLabel>Zipcode</InputLabel>
                          <OutlinedInput {...register('zipCode')} label="Zipcode" error={Boolean(errors.zipCode)} />
                          {errors.zipCode?.message && <FormHelperText error>{errors.zipCode.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth>
                          <Controller
                            name="dateOfBirth"
                            control={control}
                            defaultValue={trainer?.dateOfBirth ? dayjs(trainer.dateOfBirth).format('YYYY-MM-DD') : ''}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Date of Birth"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                error={Boolean(errors.dateOfBirth)}
                                helperText={errors.dateOfBirth ? errors.dateOfBirth.message : ''}
                                inputProps={{
                                  shrink: true,
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const date = new Date(value);
                                  if (date > new Date()) {
                                    // Handle the case where the selected date is in the future
                                    toast.error('Date of birth cannot be in the future');
                                    return;
                                  }
                                  field.onChange(e);
                                }}
                              />
                            )}
                          />
                          {errors.dateOfBirth?.message && (
                            <FormHelperText error>{errors.dateOfBirth.message}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth>
                          <InputLabel>Phone Number</InputLabel>
                          <OutlinedInput
                            {...register('phoneNumber')}
                            label="Phone Number"
                            error={Boolean(errors.phoneNumber)}
                          />
                          {errors.phoneNumber?.message && <FormHelperText>{errors.phoneNumber.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth>
                          <Controller
                            name="gender"
                            control={control}
                            defaultValue={trainer?.gender} // Replace fetchedData.gender with the actual value from your backend response
                            render={({ field }) => (
                              <RadioGroup {...field} row>
                                <FormControlLabel value="male" control={<Radio />} label="Male" />
                                <FormControlLabel value="female" control={<Radio />} label="Female" />
                              </RadioGroup>
                            )}
                          />
                          {errors.gender?.message && <FormHelperText error>{errors.gender.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={12} p={2}>
                        <FormControl fullWidth>
                          <TextField
                            {...register('address')}
                            label="Address"
                            error={Boolean(errors.address)}
                            helperText={errors.address?.message}
                            multiline
                            rows={4} // Increase the number of rows here
                            variant="outlined"
                            fullWidth
                          />
                          {errors.address?.message && <FormHelperText error>{errors.address.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
          <Button
            className="common-button"
            type="submit"
            variant="contained"
            onClick={() => {
              setRedirectTo('trainers');
            }}
            disabled={isSubmitting}
          >
            Update
          </Button>
          <Button
            className="common-button"
            type="submit"
            variant="contained"
            onClick={() => {
              setRedirectTo('profile-detail');
            }}
            disabled={isSubmitting}
          >
            Update and next
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
        </Stack>
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
