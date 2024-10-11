'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, CardActions, CardContent, Stack } from '@mui/material';
import { Minus, Plus, Trash, Upload } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';

interface TrainerBannerImages {
  bannerImageUrl: string;
  id: number;
}

interface TrainerS {
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
  trainerBannerImages: TrainerBannerImages[];
}

const ImageUploadCards = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Update the type to allow null for the url
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  interface ImageType {
    url: string | File | null; // URL can be a string, File, or null
    imageId: string | number | null; // imageId can be a string, number, or null
  }

  // const defaultImage: ImageType = { url: null, imageId: null };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get<{ data: TrainerS }>(`/users/${id}`, { params: { userType: 2 } });
        const fetchedImages: ImageType[] = response.data.data.trainerBannerImages.map((img: TrainerBannerImages) => ({
          url: img.bannerImageUrl,
          imageId: img.id,
        }));

        // Fill remaining slots with null objects
        setImages([
          ...fetchedImages.slice(0, 5),
          // ...Array(Math.max(0, 5 - fetchedImages.length)).fill(defaultImage), // Ensure non-negative length
        ]);
      } catch (error: unknown) {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      }
    };

    void fetchImages();
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
        } catch (error: unknown) {
          let errorMessage: string;
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            // Handle other types of errors, or set a generic message
            errorMessage = 'An unexpected error occurred';
          }
          // Convert the Error object to a string
          toast.error(errorMessage);
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
      setLoading(true);
      const formData = new FormData();

      // Loop through the images and append them directly to formData
      images.forEach((image) => {
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
    } catch (error: unknown) {
      let errorMessage: string;
      if (typeof error === 'string') {
        errorMessage = error;
      } else {
        // Handle other types of errors, or set a generic message
        errorMessage = 'An unexpected error occurred';
      }
      // Convert the Error object to a string
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <div>
      <Stack className="banner-image">
        {/* <Grid item md={6}> */}
        {/* <Stack> */}
        {images.map((imagePreview, index) => (
          <Card key={index} sx={{ margin: '30px 20px', width: '45%' }}>
            <CardActions>
              <Button component="label" fullWidth variant="text">
                Upload picture
                <input type="file" accept="image/*" hidden onChange={handleImageChange(index)} />
              </Button>
            </CardActions>
            <CardContent>
              <Stack sx={{ alignItems: 'center' }}>
                {imagePreview.url && (
                  <Stack spacing={1}>
                    <img
                      src={imagePreview.url instanceof File ? URL.createObjectURL(imagePreview.url) : imagePreview.url} // Check if imagePreview is a File object
                      alt={`Profile Preview ${index + 1}`}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <Button color="error" startIcon={<Trash />} onClick={handleRemoveImage(index)}>
                      Remove Image
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
        {/* </Grid> */}
        {/* </Stack> */}
      </Stack>

      {images.length < 5 && (
        <Button
          sx={{ margin: '20px 20px' }}
          variant="contained"
          color="primary"
          startIcon={<Plus />}
          onClick={handleAddCard}
        >
          Add Another Image
        </Button>
      )}

      {images.length > 1 && (
        <Button
          sx={{ margin: '20px 20px' }}
          variant="contained"
          color="secondary"
          startIcon={<Minus />}
          onClick={handleRemoveLastCard}
        >
          Remove Last Image
        </Button>
      )}

      <Button
        variant="contained"
        color="success"
        startIcon={<Upload />}
        onClick={handleUploadImages}
        disabled={images.every((image) => image.url === null)}
        sx={{ margin: '20px 20px' }}
      >
        Upload Images
      </Button>
    </div>
  );
};

export default ImageUploadCards;
