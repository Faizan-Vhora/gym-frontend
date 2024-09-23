'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormHelperText, Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Stack } from '@mui/system';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { REGEX_VALIDATION } from '@/utils/constant';

const accountDetailsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full Name is required')
    .regex(REGEX_VALIDATION.FULL_NAME, 'Full Name should not contain numbers or special characters'),
  email: z.string().min(1, 'Email is required').email(),
  phoneNumber: z
    .string()
    .nullable() // Allow phoneNumber to be null
    .refine(
      (value) => {
        if (value) {
          return REGEX_VALIDATION.PHONE_NUMBER.test(value); // Validate if not null
        }
        return true; // If value is null, validation passes
      },
      {
        message: 'Invalid phone number format',
      }
    ),
  address: z.string().nullable(),
});

export function AccountDetailsForm(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [changeProfileImage, setChangeProfileImage] = React.useState(false);
  const router = useRouter();

  interface User {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    profileImageUrl: string;
  }

  // Fetch user details from the API
  useEffect(() => {
    const fetchUserDetails = async (): Promise<void> => {
      try {
        const response = await axiosInstance.get<{ data: User }>('/auth/profile');
        const fetchedUser = response.data.data;
        setUser(fetchedUser);
        reset(fetchedUser); // Reset the form with fetched user data
      } catch (err: unknown) {
        let errorMessage = 'Failed to fetch user details';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
      }
    };

    fetchUserDetails().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching Account Details: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Get reset function from useForm
  } = useForm<User>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '', // Ensure this is initialized
      address: user?.address || '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(selectedFile);
      setUser((prevUser) => (prevUser ? { ...prevUser, profileImageUrl: imageUrl } : null));
      setChangeProfileImage(true);
    }
  };

  const onSubmit = async (data: User): Promise<void> => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      const fields = [
        { key: 'fullName', value: data.fullName },
        { key: 'email', value: data.email },
        { key: 'phoneNumber', value: data.phoneNumber || '' },
        { key: 'address', value: data.address },

        { key: 'profileImage', value: file }, // Ensure imageFile is properly set

        { key: 'changeProfileImage', value: changeProfileImage ? 'true' : 'false' }, // Convert boolean to string
      ];

      fields.forEach(({ key, value }): void => {
        // Only append valid values
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      // Update user details via API
      const response = await axiosInstance.post<{ data: User }>('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.data;
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Failed to update user details';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Profile Image and Upload */}
            <Grid item md={4} xs={12}>
              <Card>
                <CardContent>
                  <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar src={user.profileImageUrl || ''} sx={{ height: '100px', width: '100px' }} />
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button component="label" fullWidth variant="contained">
                    {user.profileImageUrl ? 'Change Profile Image' : 'Upload Profile Image'}
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Form Inputs for User Information */}
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <FormControl fullWidth required error={Boolean(errors.fullName)}>
                    <InputLabel>Full Name</InputLabel>
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => <OutlinedInput {...field} label="Full Name" />}
                    />
                    {errors.fullName?.message && <FormHelperText error>{errors.fullName.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item md={6} xs={12}>
                  <FormControl fullWidth required error={Boolean(errors.email)}>
                    <InputLabel>Email</InputLabel>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => <OutlinedInput {...field} label="Email" type="email" />}
                    />
                    {errors.email?.message && <FormHelperText error>{errors.email.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item md={6} xs={12}>
                  <FormControl fullWidth error={Boolean(errors.phoneNumber)}>
                    <InputLabel>Phone Number</InputLabel>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => <OutlinedInput {...field} label="Phone Number" type="tel" />}
                    />
                    {errors.phoneNumber?.message && <FormHelperText error>{errors.phoneNumber.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item md={12} xs={12}>
                  <FormControl fullWidth error={Boolean(errors.address)}>
                    <InputLabel>Address</InputLabel>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => <OutlinedInput {...field} label="Address" />}
                    />
                    {errors.address?.message && <FormHelperText error>{errors.address.message}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>

        {/* Save Button */}
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save details'}
          </Button>
        </CardActions>

        <ToastContainer />
      </Card>
    </form>
  );
}
