'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import { Stack } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

export function AccountDetailsForm(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  interface User {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    profileImageUrl: string;
  }

  // Fetch user details from the API
  useEffect(() => {
    const fetchUserDetails = async (): Promise<void> => {
      try {
        const response = await axiosInstance.get<{ data: User }>('/auth/profile');
        const fetchedUser = response.data.data;
        setUser(fetchedUser);
      } catch (err: unknown) {
        let errorMessage = 'Failed to fetch user details';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
      }
    };

    // Call the async function within the useEffect
    fetchUserDetails().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching Account Details: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setUser((prevUser) => (prevUser ? { ...prevUser, [name]: value } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(selectedFile);
      setUser((prevUser) => (prevUser ? { ...prevUser, profileImageUrl: imageUrl } : null));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('fullName', user.fullName);
      formData.append('email', user.email);
      formData.append('phoneNumber', user.phoneNumber || '');
      formData.append('address', user.address || '');

      if (file) {
        formData.append('profileImage', file);
      }

      // Update user details via API
      const response = await axiosInstance.post<{ data: User }>('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      let errorMessage = 'Failed to update user details';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Full Name</InputLabel>
                <OutlinedInput value={user.fullName} label="Full Name" name="fullName" onChange={handleInputChange} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Email</InputLabel>
                <OutlinedInput
                  value={user.email}
                  label="Email"
                  name="email"
                  type="email"
                  onChange={handleInputChange}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput
                  value={user.phoneNumber || ''}
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  onChange={handleInputChange}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Address</InputLabel>
                <OutlinedInput value={user.address || ''} label="Address" name="address" onChange={handleInputChange} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <CardContent>
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                  <div>
                    <Avatar src={user.profileImageUrl} sx={{ height: '80px', width: '80px' }} />
                  </div>
                  <Stack spacing={1} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{user.fullName}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {user.address}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
              <Divider />
              <CardActions>
                <Button component="label" fullWidth variant="text">
                  Upload picture
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
              </CardActions>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save details'}
          </Button>
        </CardActions>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </Card>
      <ToastContainer />
    </form>
  );
}
