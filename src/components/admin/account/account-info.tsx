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
import { toast } from 'react-toastify';

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

  interface User {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    profileImageUrl: string;
  }

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user') ?? null;

    if (storedUser) {
      try {
        const userData: User | null = JSON.parse(storedUser) as User;
        setUser(userData);
      } catch (error) {
        toast.error(`Failed to parse user data:', error`);
        // Optionally handle parsing errors here
      }
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  interface UserProfileResponse {
    data: {
      fullName: string;
      email: string;
      phoneNumber: string;
      address: string;
      profileImageUrl: string;
    };
  }

  const handleUpload = async (): Promise<void> => {
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await axiosInstance.post<UserProfileResponse>('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Safely access the response data with type assertions
      const newAvatarUrl = response.data.data.profileImageUrl;
      const updatedUser = { ...user, profileImageUrl: newAvatarUrl };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message; // Safely access message property
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // Automatically upload when a file is selected
    if (file) {
      const uploadFile = async (): Promise<void> => {
        try {
          await handleUpload();
        } catch (error) {
          let errorMessage: string;
          if (error instanceof Error) {
            errorMessage = error.message; // Safely access message property
          } else {
            errorMessage = 'An unexpected error occurred';
          }
          toast.error(errorMessage);
        }
      };
      void uploadFile();
    }
  }, [file]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user.profileImageUrl || '/assets/User@3x-1.png'} sx={{ height: '80px', width: '80px' }} />
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
