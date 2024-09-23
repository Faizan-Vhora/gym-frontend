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
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { REGEX_VALIDATION } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { Trash } from '@phosphor-icons/react';
import dayjs, { Dayjs } from 'dayjs';

import type { Trainer } from '@/components/dashboard/trainer/trainer-table';

import TrainerAdditionalForm from './trainer-additional-form';

export default function TrainerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [redirectTo, setRedirectTo] = useState<'trainers' | 'additional-details'>('trainers');
  const [tab, setTab] = useState(0); // State to control the active tab
  const [changeProfileImage, setChangeProfileImage] = React.useState(false);

  const trainerSchema = z.object({
    fullName: z
      .string()
      .min(1, 'Full Name is required')
      .regex(REGEX_VALIDATION.FULL_NAME, 'Full Name should not contain numbers or special characters'),
    email: z.string().min(1, { message: 'Email is required' }).email(),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (value) {
            // Define your regex here
            return REGEX_VALIDATION.PHONE_NUMBER.test(value); // Example regex for a 10-digit phone number
          }
          return true; // If value is undefined or empty, skip regex validation
        },
        {
          message: 'Invalid phone number format',
        }
      ),
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
    zipCode: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (value) {
            // Define your regex here
            return REGEX_VALIDATION.ZIP_CODE.test(value); // Example regex for a 10-digit phone number
          }
          return true; // If value is undefined or empty, skip regex validation
        },
        {
          message: 'Invalid Zip Code format',
        }
      ), // Add zipcode field
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

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: TrainerFormInputs }>(`/users/${id}`, {
          params: { userType: 2 },
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

  interface TrainerData {
    data: Trainer;
  }

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
      setChangeProfileImage(true);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleRemoveImage = (): void => {
    setImagePreview(null);
    setImageFile(null);
    setChangeProfileImage(true);
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
      { key: 'userType', value: '3' }, // Static value
      { key: 'zipCode', value: data.zipCode },
      { key: 'gender', value: data.gender },
      { key: 'password', value: data.password },
      { key: 'profileImage', value: imageFile }, // Ensure imageFile is properly set
      { key: 'dateOfBirth', value: data.dateOfBirth },
      { key: 'changeProfileImage', value: changeProfileImage ? 'true' : 'false' }, // Convert boolean to string
    ];

    fields.forEach(({ key, value }): void => {
      // Only append valid values
      if (value !== undefined && value !== null) {
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
      } else if (destination === 'additional-details') {
        router.push(`/dashboard/trainers/form/additional-details?id=${response?.data?.data?.id}`);
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
    <Box>
      <Card>
        <CardHeader title={id ? 'Edit Trainer' : 'Create Trainer'} />
        <Divider />
        {id && (
          <Stack sx={{ marginLeft: '20px' }}>
            <Divider />
            <Tabs value={tab} onChange={handleTabChange} aria-label="Addiitional datials form tabs">
              <Tab label="Basic Info" />
              <Tab label="Additional Details" />
            </Tabs>
          </Stack>
        )}
        {tab === 0 && (
          <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, redirectTo))}>
            <CardContent>
              <Stack spacing={3}>
                <Grid container spacing={10}>
                  {id && (
                    <Grid item md={4} xs={12}>
                      <Card sx={{ marginBottom: '40px' }}>
                        <CardActions>
                          <Button component="label" fullWidth variant="text">
                            Upload picture
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleImageChange}
                              style={{ display: 'none' }}
                            />
                          </Button>
                        </CardActions>
                        <CardContent>
                          <Stack sx={{ alignItems: 'center' }}>
                            {imagePreview && (
                              <Stack spacing={1} mt={2}>
                                <img
                                  src={imagePreview || '/assets/User@3x-1.png'}
                                  alt="Profile Preview"
                                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                                />
                                <Button color="error" startIcon={<Trash />} onClick={handleRemoveImage}>
                                  Remove Image
                                </Button>
                              </Stack>
                              // <div
                              //   style={{ position: 'relative', width: '100%', maxHeight: '200px', marginTop: '1rem' }}
                              // >
                              // </div>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          background: 'linear-gradient(135deg, #8B0000, #000000)', // Darker, classic red with black
                          boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.3)', // Softer, wider shadow for a timeless feel
                          borderRadius: '8px', // Slightly rounded corners for a refined look
                          padding: '16px', // Ensure good spacing inside the card
                          color: 'white', // Keeps the text readable on dark background
                          fontFamily: '"Georgia", serif', // Optional: Use a serif font for a classic text style
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2} sx={{ alignItems: 'center' }}>
                            <div>
                              <div
                                style={{ position: 'relative', width: '100%', maxHeight: '200px', marginTop: '1rem' }}
                              >
                                <img
                                  src={trainer?.qrCodeImageUrl || '/assets/User@3x-1.png'}
                                  alt="QR Preview"
                                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                                />
                              </div>
                            </div>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  <Grid item md={id ? 8 : 12} xs={12} marginTop={3} marginLeft={id ? 0 : 2}>
                    <Grid container spacing={10}>
                      <Grid item md={12} xs={12}>
                        <Grid container spacing={4}>
                          <Grid item md={id ? 6 : 4} p={2}>
                            <FormControl fullWidth required error={Boolean(errors.fullName)}>
                              <InputLabel>Full Name</InputLabel>
                              <OutlinedInput
                                {...register('fullName', { required: 'Full name is required' })}
                                label="Full Name"
                                error={Boolean(errors.fullName)}
                              />
                              {errors.fullName?.message && (
                                <FormHelperText error>{errors.fullName.message}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item md={id ? 6 : 4} p={2}>
                            <FormControl fullWidth required error={Boolean(errors.email)}>
                              <InputLabel>Email</InputLabel>
                              <OutlinedInput {...register('email')} label="Email" type="email" />
                              {errors.email?.message && <FormHelperText error>{errors.email.message}</FormHelperText>}
                            </FormControl>
                          </Grid>
                          <Grid item md={id ? 6 : 4} p={2}>
                            <Controller
                              name="password"
                              control={control}
                              rules={{ required: !id ? 'Password is required' : false }}
                              render={({ field }) => (
                                <FormControl fullWidth required={!id} error={Boolean(errors.password)}>
                                  <InputLabel>Password</InputLabel>
                                  <OutlinedInput
                                    {...field}
                                    label="Password"
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
                                  {errors.password?.message && (
                                    <FormHelperText error>{errors.password.message}</FormHelperText>
                                  )}
                                </FormControl>
                              )}
                            />
                          </Grid>
                          {id && (
                            <>
                              <Grid item md={6} p={2}>
                                <FormControl fullWidth error={Boolean(errors.zipCode)}>
                                  <InputLabel>Zipcode</InputLabel>
                                  <OutlinedInput
                                    {...register('zipCode')}
                                    label="Zipcode"
                                    error={Boolean(errors.zipCode)}
                                  />
                                  {errors.zipCode?.message && (
                                    <FormHelperText error>{errors.zipCode.message}</FormHelperText>
                                  )}
                                </FormControl>
                              </Grid>
                              <Grid item md={6} p={2}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <FormControl fullWidth>
                                    <Controller
                                      name="dateOfBirth"
                                      control={control}
                                      render={({ field, fieldState: { error: fieldError } }) => (
                                        <DatePicker
                                          disableFuture
                                          format="MM-DD-YYYY"
                                          views={['year', 'month', 'day']}
                                          defaultValue={trainer?.dateOfBirth ? dayjs(trainer.dateOfBirth) : null}
                                          label="Date of Birth"
                                          value={trainer?.dateOfBirth ? dayjs(trainer.dateOfBirth) : null}
                                          onChange={(newValue: Dayjs | null) => {
                                            if (newValue) {
                                              field.onChange(newValue.format('YYYY-MM-DD'));
                                            }
                                          }}
                                          slotProps={{
                                            textField: {
                                              fullWidth: true,
                                              error: Boolean(fieldError), // Use Boolean to convert to a boolean value
                                              helperText: fieldError ? fieldError.message : '', // Use fieldError instead of error
                                            },
                                          }}
                                        />
                                      )}
                                    />
                                    {errors.dateOfBirth ? (
                                      <FormHelperText>{errors.dateOfBirth.message}</FormHelperText>
                                    ) : null}
                                  </FormControl>
                                </LocalizationProvider>
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
                                  {errors.gender?.message && (
                                    <FormHelperText error>{errors.gender.message}</FormHelperText>
                                  )}
                                </FormControl>
                              </Grid>
                              <Grid item md={6} p={2}>
                                <FormControl fullWidth error={Boolean(errors.phoneNumber)}>
                                  <InputLabel>Phone Number</InputLabel>
                                  <OutlinedInput
                                    {...register('phoneNumber')}
                                    label="Phone Number"
                                    error={Boolean(errors.phoneNumber)}
                                  />
                                  {errors.phoneNumber?.message && (
                                    <FormHelperText>{errors.phoneNumber.message}</FormHelperText>
                                  )}
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
                                  {errors.address?.message && (
                                    <FormHelperText error>{errors.address.message}</FormHelperText>
                                  )}
                                </FormControl>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
            <Divider />
            <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
              <Button
                className="common-button"
                variant="contained"
                disabled={isSubmitting}
                onClick={() => {
                  setRedirectTo('trainers');
                }} // Set redirectTo and then submit the form
                type="submit"
              >
                {id ? 'Update' : 'Save'}
              </Button>

              {!id && (
                <Button
                  className="common-button"
                  variant="contained"
                  disabled={isSubmitting}
                  type="submit"
                  onClick={() => {
                    setRedirectTo('additional-details');
                  }} // Set redirectTo and then submit the form
                >
                  Save and Next
                </Button>
              )}
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
          </Box>
        )}
        {tab === 1 && <TrainerAdditionalForm />}
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
