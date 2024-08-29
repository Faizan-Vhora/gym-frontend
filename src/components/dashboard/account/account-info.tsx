'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import axiosInstance from '@/lib/axios';

export function AccountInfo(): React.JSX.Element {
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    profileImageUrl: string;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Retrieve user data from localStorage

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    const formData = new FormData();

    formData.append('profileImage', file);

    try {
      const response = await axiosInstance.post('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local storage with the new avatar URL

      const newAvatarUrl = response.data.avatarUrl;

      const updatedUser = { ...user, avatar: newAvatarUrl };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
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
    </Card>
  );
}
