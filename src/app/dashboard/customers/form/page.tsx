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
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { REGEX_VALIDATION } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
// import { DatePicker } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Trash } from '@phosphor-icons/react';
import dayjs, { Dayjs } from 'dayjs';

import type { Customer } from '@/components/dashboard/customer/customers-table';
import MembershipPlanCard from '@/components/dashboard/membership-plan/membership-card';
import { MembershipPlans } from '@/components/dashboard/membership-plan/membership-plan-table';

import { CheckInTableView, type CheckInEntry } from './check-in-view';

export default function CustomerEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormInputs | null>(null);
  const [customerS, setCustomerS] = useState<CustomerS | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [changeProfileImage, setChangeProfileImage] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [redirectTo, setRedirectTo] = useState<'customers' | 'additional-details'>('customers');
  const [plans, setPlans] = useState<PlanI[]>([]);
  const [tab, setTab] = useState(0); // State to control the active tab
  const [checkInPage, setPage] = useState(0);
  const [checkInRowsPerPage, setRowsPerPage] = useState(5);
  const [checkInEntries, setCheckInEntries] = useState<CheckInEntry[]>([]);
  const [totalCheckInEntries, setTotalCheckInEntries] = useState<number>(0);

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
    memberId: z.string().optional(),
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
      setValue('memberId', customer.memberId || '');
    }
  }, [customer, setValue]);

  interface MembershipPlanResponse {
    data: MembershipPlans[];
  }
  interface PlanI {
    id: string;
    title: string;
    durationInMonths: number;
    expiryDate: Date;
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

  interface ErrorDetail {
    code?: string;
    message?: string;
  }

  interface CheckinResponse {
    data: {
      items: CheckInEntry[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchEntries: () => Promise<void> = async () => {
      setLoading(true);
      try {
        const params = {
          page: checkInPage + 1,
          limit: checkInRowsPerPage,
          userId: id,
          userType: 3,
        };
        const response = await axiosInstance.get<CheckinResponse>('/entry-logs', { params });

        const { items, meta } = response.data.data;
        if (Array.isArray(items)) {
          setCheckInEntries(items);
          setTotalCheckInEntries(meta.totalItems);
        } else {
          toast.error(
            `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
          );
          setError('Unexpected data format.');
        }
      } catch (err) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching check-ins: ${err.message}`;
        }
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries().catch((err: unknown) => {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
    });
  }, [checkInPage, checkInRowsPerPage]);

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

  const handleRemoveImage = (): void => {
    setImagePreview(null);
    setImageFile(null);
    setChangeProfileImage(true);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
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
      const startDate = new Date().toISOString().slice(0, 10);
      // Call the API to update the membership plan
      await axiosInstance.post(`/users/assign-membership`, {
        user: Number(id),
        membershipType: Number(planId),
        startDate: startDate,
      });
      toast.success('Plan updated successfully');

      // Fetch the updated user data after the plan update
      const response = await axiosInstance.get<{ data: CustomerS }>(`/users/${id}`, {
        params: { userType: 3 },
      });

      // Update the customerS state with the new data
      setCustomer(response.data.data);
      setCustomerS(response.data.data);
      router.push('/dashboard/customers');
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
        <CardHeader title={id ? `Edit Member |  ${customer?.memberId || ''}` : 'Create Member'} />
        {id && (
          <Stack sx={{ marginLeft: '20px' }}>
            <Divider />
            <Tabs value={tab} onChange={handleTabChange} aria-label="member form tabs">
              <Tab label="Basic Info" />
              <Tab label="Membership" />
              <Tab label="Check In History" />
            </Tabs>
          </Stack>
        )}
        <Divider />
        <CardContent>
          {tab === 0 && (
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
                          <FormControl fullWidth error={Boolean(errors.fullName)} required>
                            <InputLabel>Full Name</InputLabel>
                            <OutlinedInput {...register('fullName')} label="Full Name" />
                            {errors.fullName ? <FormHelperText>{errors.fullName.message}</FormHelperText> : null}
                          </FormControl>
                        </Grid>
                        <Grid item md={id ? 6 : 4} p={2}>
                          <FormControl fullWidth error={Boolean(errors.email)} required>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput {...register('email')} label="Email" type="email" />
                            {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
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
                                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
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
                                {errors.zipCode ? (
                                  <FormHelperText error>{errors.zipCode.message}</FormHelperText>
                                ) : null}
                              </FormControl>
                            </Grid>
                            <Grid item md={6} p={2}>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <FormControl fullWidth>
                                  <Controller
                                    name="dateOfBirth"
                                    control={control}
                                    render={({ field, fieldState }) => {
                                      const errorMessage = fieldState.error ? fieldState.error.message : '';

                                      return (
                                        <DatePicker
                                          disableFuture
                                          format="MM-DD-YYYY"
                                          views={['year', 'month', 'day']}
                                          defaultValue={customer?.dateOfBirth ? dayjs(customer.dateOfBirth) : null}
                                          label="Date of Birth"
                                          value={customer?.dateOfBirth ? dayjs(customer.dateOfBirth) : null}
                                          onChange={(newValue: Dayjs | null) => {
                                            if (newValue) {
                                              field.onChange(newValue.format('YYYY-MM-DD'));
                                            }
                                          }}
                                          slotProps={{
                                            textField: {
                                              fullWidth: true,
                                              error: Boolean(fieldState.error),
                                              helperText: errorMessage,
                                            },
                                          }}
                                        />
                                      );
                                    }}
                                  />
                                  {errors.dateOfBirth && <FormHelperText>{errors.dateOfBirth.message}</FormHelperText>}
                                </FormControl>
                              </LocalizationProvider>
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
                                {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
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
                                {errors.phoneNumber ? (
                                  <FormHelperText error>{errors.phoneNumber.message}</FormHelperText>
                                ) : null}
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
          )}
        </CardContent>

        <Divider />
        {tab === 0 && (
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
        )}
        {tab === 1 && (
          <>
            <Box p={2}>
              {customerS?.membership?.membershipType && (
                <Grid container>
                  <Grid container spacing={2} justifyContent="center" sx={{ margin: '10px' }}>
                    <Grid item xs={12} sm={6} md={4} key={customerS?.membership?.membershipType?.id} padding={5}>
                      <MembershipPlanCard
                        sx={{ border: '2px solid blue' }}
                        title={customerS.membership.membershipType.title}
                        durationInMonths={customerS?.membership?.membershipType?.durationInMonths}
                        expiryDate={customerS?.membership?.expiryDate}
                        description={customerS?.membership?.membershipType?.description}
                        cost={customerS?.membership?.membershipType?.cost}
                        onlyShow={false}
                        onButtonClick={(): void => {
                          undefined;
                        }}
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
                        .filter((ele: PlanI) => ele.id !== customerS?.membership?.membershipType?.id)
                        .map((plan: PlanI) => (
                          <Grid item xs={12} sm={6} md={4} key={plan.id} padding={5}>
                            <MembershipPlanCard
                              title={plan.title}
                              durationInMonths={plan.durationInMonths}
                              expiryDate={plan.expiryDate}
                              description={plan.description}
                              cost={plan.cost}
                              onlyShow={true}
                              onButtonClick={() => {
                                void handleButtonClick(plan.id);
                              }}
                            />
                          </Grid>
                        ))
                    ) : (
                      <Typography variant="h6" color="text.secondary" align="center">
                        No membership plans available.
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Box>
            <Divider />
          </>
        )}
        {tab === 2 && (
          <CheckInTableView
            entries={checkInEntries}
            count={totalCheckInEntries}
            page={checkInPage}
            rowsPerPage={checkInRowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
