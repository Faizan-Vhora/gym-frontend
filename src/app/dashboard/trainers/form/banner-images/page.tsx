
'use client';



import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Card, CardActions, CardContent, Grid, Stack } from '@mui/material';
import { Minus, Plus, Trash, Upload } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';

const ImageUploadCards = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Update the type to allow null for the url
  const [images, setImages] = useState<{ url: string | File | null; imageId: string | number | null }[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`, { params: { userType: 2 } });
        const fetchedImages = response.data.data.trainerBannerImages.map((img: any) => ({
          url: img.bannerImageUrl, // The URL of the image
          imageId: img.id, // Assuming the ID is in `img.id`
        }));

        // Fill remaining slots with null objects
        setImages([
          ...fetchedImages.slice(0, 5),
          ...Array(5 - fetchedImages.length).fill({ url: null, imageId: null }),
        ]);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [id]);

  const handleImageChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const updatedImages = [...images];
      updatedImages[index] = { url: file, imageId: null }; // Store file and set ID to null for new uploads
      setImages(updatedImages);
    }
  };

  const handleRemoveImage = (index: number) => async () => {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this image!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmed.isConfirmed) {
      const imageToRemove = images[index];

      // Call your API to delete the image using its ID
      if (imageToRemove.imageId) {
        try {
          const response = await axiosInstance.delete(`/trainer/trainer-banner/${imageToRemove.imageId}`);
          if (response.status === 200) {
            const updatedImages = [...images];
            updatedImages[index] = { url: null, imageId: null }; // Set the image to null for that index
            setImages(updatedImages);
            toast.success('Image deleted successfully');
          } else {
            toast.error('Failed to delete image');
          }
        } catch (error) {
          console.error('An error occurred while deleting the image:', error);
          toast.error('An error occurred while deleting the image');
        }
      } else {
        // Handle case where the image does not have an ID (e.g., a newly uploaded image)
        const updatedImages = [...images];
        updatedImages[index] = { url: null, imageId: null };
        setImages(updatedImages);
        toast.success('Image removed successfully');
      }
    }
  };

  const handleAddCard = () => {
    if (images.length < 5) {
      setImages([...images, { url: null, imageId: null }]); // Add a new empty image object to the array
    }
  };

  const handleRemoveLastCard = () => {
    if (images.length > 1) {
      setImages(images.slice(0, -1)); // Remove the last card
    }
  };

  const handleUploadImages = async () => {
    try {
      const formData = new FormData();

      // Loop through the images and append them directly to formData
      images.forEach((image, index) => {
        if (image.url instanceof File) {
          // Only append if it's a file being uploaded
          formData.append(`bannerImage`, image.url);
        }
      });

      const response = await axiosInstance.put(`/trainer/${id}/upload-banner-image`, formData);

      if (response.status === 200) {
        toast.success('Images uploaded successfully');
        // Optionally fetch updated images or redirect
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('An error occurred while uploading images:', error);
      toast.error('An error occurred while uploading images: ' + error);
    }
  };

  return (
    <div>
      {images.map((imagePreview, index) => (
        <Grid container spacing={5} key={index}>
          <Grid item md={6}>
            <Card sx={{ marginBottom: '40px' }}>
              <CardActions>
                <Button component="label" fullWidth variant="text">
                  Upload picture
                  <input type="file" accept="image/*" hidden onChange={handleImageChange(index)} />
                </Button>
              </CardActions>
              <CardContent>
                <Stack sx={{ alignItems: 'center' }}>
                  {imagePreview.url && (
                    <Stack spacing={1} mt={2}>
                      <img
                        src={
                          imagePreview.url instanceof File ? URL.createObjectURL(imagePreview.url) : imagePreview.url
                        } // Check if imagePreview is a File object
                        alt={`Profile Preview ${index + 1}`}
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                      />
                      <Button color="error" startIcon={<Trash />} onClick={handleRemoveImage(index)}>
                        Remove Image
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ))}

      {images.length < 5 && (
        <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleAddCard}>
          Add Another Image
        </Button>
      )}

      {images.length > 1 && (
        <Button variant="contained" color="secondary" startIcon={<Minus />} onClick={handleRemoveLastCard}>
          Remove Last Image
        </Button>
      )}

      <Button
        variant="contained"
        color="success"
        startIcon={<Upload />}
        onClick={handleUploadImages}
        disabled={images.every((image) => image.url === null)}
      >
        Upload Images
      </Button>
    </div>
  );
};

export default ImageUploadCards;
