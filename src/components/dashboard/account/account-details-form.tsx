'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
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

import axiosInstance from '@/lib/axios';

// Updated User type with id
type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
};

export function AccountDetailsForm(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prevUser) => (prevUser ? { ...prevUser, [name]: value } : null));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.put(`/users/${user.id}`, user); // API endpoint with user.id
      const newUser = response.data.data; // Assuming response contains the updated user data
      setUser(newUser); // Update state with the response data

      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err: any) {
      console.error('Update error:', err);
      setError('Failed to update user details.');
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
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save details'}
          </Button>
        </CardActions>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </Card>
    </form>
  );
}
