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
  Typography,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import { padding } from '@mui/system';
import { Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import type { Customer } from '@/components/dashboard/customer/customers-table';
import MembershipPlanCard from '@/components/dashboard/membership-plan/membership-card';
import { MembershipPlans } from '@/components/dashboard/membership-plan/membership-plan-table';

export default function CustomerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormInputs | null>(null);
  const [customerS, setCustomerS] = useState<CustomerS | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [redirectTo, setRedirectTo] = useState<'customers' | 'additional-details'>('customers');
  const [plans, setPlans] = useState<PlanI[]>([]);

  interface CustomerS {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    memberId: string;
    status: number; // Ensure this is part of the interface
    qrCodeImageUrl: string;
    membership: {
      startDate: Date;
      expiryDate: Date;
      status: string;
      paymentStatus: string;
      membershipType: {
        id: string;
        title: string;
        durationInMonths: number;
        description: string;
        cost: number;
        paymentFrequency: string;
      };
    };
  }

  const customerSchema = z.object({
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

  type CustomerFormInputs = z.infer<typeof customerSchema>;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    mode: 'onBlur',
  });

  interface CustomerData {
    data: Customer;
  }

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: CustomerS }>(`/users/${id}`, {
          params: { userType: 3 },
        })
        .then((response) => {
          setCustomer(response.data.data);
          setCustomerS(response.data.data);
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
    if (customer) {
      setValue('fullName', customer.fullName);
      setValue('email', customer.email);
      setValue('phoneNumber', customer.phoneNumber || '');
      setValue('address', customer.address || '');
      setValue('password', customer.password);
      setImagePreview(customer.profileImageUrl || '');
      setValue('gender', customer.gender || '');
      setValue('zipCode', customer.zipCode || '');
      setValue('qrCodeImageUrl', customer.qrCodeImageUrl || '');
      setValue('dateOfBirth', customer.dateOfBirth || '');
    }
  }, [customer, setValue]);

  interface MembershipPlanResponse {
    data: MembershipPlans[];
  }
  interface PlanI {
    id: string;
    title: string;
    durationInMonths: number;
    description: string;
    cost: number;
    paymentFrequency: string;
  }

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get<MembershipPlanResponse>('/membership-types/dropdown');
        setPlans(response.data.data);
        setLoading(true);
      } catch (err: unknown) {
        let errorMessage: string;
        if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    void fetchPlans();
  }, []);

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

  const onSubmit = async (data: CustomerFormInputs, destination: string): Promise<void> => {
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
      { key: 'dateOfBirth', value: data.dateOfBirth ? dayjs(data.dateOfBirth).format('YYYY-MM-DD') : '' }, // Convert Date to YYYY-MM-DD
    ];

    fields.forEach(({ key, value }): void => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/users/${id}` : '/users';

      const response: { data: CustomerData } = await axiosInstance({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Member saved successfully');

      if (destination === 'customers') {
        router.push('/dashboard/customers');
      } else if (destination === 'additional-details') {
        router.push(`/dashboard/customers/form/additional-details?id=${response?.data?.data?.id}`);
      }
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
      setError('Failed to save Member details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!customer && id) {
    return <div>Loading...</div>;
  }

  const handleButtonClick = async (planId: string) => {
    try {
      // Call the API to update the membership plan
      await axiosInstance.post(`/users/assign-membership`, { user: Number(id), membershipType: Number(planId) });
      toast.success('Plan updated successfully');

      // Fetch the updated user data after the plan update
      const response = await axiosInstance.get<{ data: CustomerS }>(`/users/${id}`, {
        params: { userType: 3 },
      });

      // Update the customerS state with the new data
      setCustomer(response.data.data);
      setCustomerS(response.data.data);
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, redirectTo))}>
      <Card>
        <CardHeader title={id ? 'Edit Member' : 'Create Member'} />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Grid container spacing={10}>
              {id && (
                <>
                  <Grid item md={4} xs={12}>
                    <Card
                      sx={{
                        marginBottom: '40px',
                      }}
                    >
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
                            <div style={{ position: 'relative', width: '100%', maxHeight: '200px', marginTop: '1rem' }}>
                              <img
                                src={customer?.qrCodeImageUrl || '/assets/User@3x-1.png'}
                                alt="QR Preview"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                              />
                            </div>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              <Grid item md={id ? 8 : 12} xs={12} marginTop={3} marginLeft={id ? 0 : 2}>
                <Grid container spacing={10}>
                  <Grid item md={12} xs={12}>
                    <Grid container spacing={4}>
                      <Grid item md={id ? 6 : 4} p={2}>
                        <FormControl fullWidth required>
                          <InputLabel>Full Name</InputLabel>
                          <OutlinedInput
                            {...register('fullName', { required: 'Full name is required' })}
                            label="Full Name"
                            error={Boolean(errors.fullName)}
                          />
                          {errors.fullName?.message && <FormHelperText error>{errors.fullName.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={id ? 6 : 4} p={2}>
                        <FormControl fullWidth required>
                          <InputLabel>Email</InputLabel>
                          <OutlinedInput
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                            })}
                            label="Email"
                            type="email"
                            error={Boolean(errors.email)}
                          />
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
                            <FormControl fullWidth>
                              <InputLabel>Zipcode</InputLabel>
                              <OutlinedInput {...register('zipCode')} label="Zipcode" error={Boolean(errors.zipCode)} />
                              {errors.zipCode?.message && (
                                <FormHelperText error>{errors.zipCode.message}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item md={6} p={2}>
                            <FormControl fullWidth>
                              <Controller
                                name="dateOfBirth"
                                control={control}
                                defaultValue={
                                  customer?.dateOfBirth ? dayjs(customer.dateOfBirth).format('YYYY-MM-DD') : ''
                                }
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
                              <Controller
                                name="gender"
                                control={control}
                                defaultValue={customer?.gender} // Replace fetchedData.gender with the actual value from your backend response
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
                          <Grid item md={6} p={2}>
                            <FormControl fullWidth>
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
              setRedirectTo('customers');
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
              router.push('/dashboard/customers');
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
        <Divider />
        <Box>
          {customerS?.membership && (
            <Grid container>
              <Grid container spacing={2} justifyContent="center" sx={{ margin: '10px' }}>
                <Grid item xs={12} sm={6} md={4} key={customerS?.membership?.membershipType?.id} padding={5}>
                  <MembershipPlanCard
                    title={customerS.membership.membershipType.title}
                    durationInMonths={customerS?.membership?.membershipType?.durationInMonths}
                    description={customerS?.membership?.membershipType?.description}
                    cost={customerS?.membership?.membershipType?.cost}
                    onlyShow={false}
                    onButtonClick={(): void => {}}
                  />
                </Grid>
                <Grid></Grid>
                <ToastContainer />
              </Grid>
            </Grid>
          )}

          <Card>
            <CardHeader title="Available plans" />
            <Grid container>
              <Grid container spacing={2} justifyContent="center" sx={{ margin: '10px' }}>
                {plans.length > 0 ? (
                  plans
                    .filter((ele: any) => ele.id != customerS?.membership?.membershipType?.id)
                    .map((plan: PlanI) => (
                      <Grid item xs={12} sm={6} md={4} key={plan.id} padding={5}>
                        <MembershipPlanCard
                          title={plan.title}
                          durationInMonths={plan.durationInMonths}
                          description={plan.description}
                          cost={plan.cost}
                          onlyShow={true}
                          onButtonClick={() => {
                            handleButtonClick(plan.id);
                          }}
                        />
                      </Grid>
                    ))
                ) : (
                  <Typography variant="h6" color="text.secondary" align="center">
                    No membership plans available.
                  </Typography>
                )}

                <ToastContainer />
              </Grid>
            </Grid>
          </Card>
        </Box>
        <Divider />

        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
