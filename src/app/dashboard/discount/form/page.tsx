'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import {
  DiscountEntry,
  DiscountStatus,
  DiscountType,
  UsageLimit,
} from '@/components/dashboard/discount/discount-table';

// Define your validation schemas
const baseDiscountSchema = z.object({
  codeName: z.string().min(1, 'Code Name is required'),
  expiryDate: z.string().min(1, 'Expiry Date is required'),
  discountType: z.enum([DiscountType.Percentage, DiscountType.Fix], 'Discount Type is required'),
  usageLimit: z.enum([UsageLimit.Once, UsageLimit.Twice, UsageLimit.NoLimit], 'Usage Limit is required'),
  discountValue: z.number().min(1, 'Discount Value is required'),
  description: z.string().min(1, 'Description is required'),
  discountImage: z.string().min(1, 'Discount Image is required'),
  status: z.enum([DiscountStatus.Active, DiscountStatus.Inactive, DiscountStatus.Expired]).optional(),
  isNewUser: z.boolean().optional(),
});

const updateDiscountSchema = baseDiscountSchema.partial().extend({
  discountImage: z.string().optional(),
});

export default function DiscountFormPage(): React.JSX.Element {
  const [discount, setDiscount] = React.useState<DiscountEntry>({
    id: 0,
    codeName: '',
    expiryDate: '',
    discountType: DiscountType.Percentage,
    usageLimit: UsageLimit.Once,
    discountValue: 0,
    description: '',
    status: DiscountStatus.Active,
    isNewUser: false,
    discountImage: '', // This will hold the file URL or path
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null); // To hold the uploaded image file
  const [imagePreview, setImagePreview] = React.useState<string | null>(null); // To hold the image preview URL
  const [errors, setErrors] = React.useState<z.ZodFormattedError<z.object>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const discountId = searchParams.get('id');

  React.useEffect(() => {
    if (discountId) {
      axiosInstance
        .get(`/discount/${discountId}`)
        .then((response) => {
          const data = response.data.data;
          if (data && typeof data.discountValue === 'string') {
            data.discountValue = parseFloat(data.discountValue);
          }
          setDiscount(data);
          if (data.discountImage) {
            setImagePreview(data.discountImage); // Set preview if image exists
          }
        })
        .catch((error) => console.error('Error fetching discount:', error));
    }
  }, [discountId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => {
      const newValue = name === 'discountValue' ? parseFloat(value) : value;
      return {
        ...prevDiscount,
        [name]: newValue,
      };
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [name as string]: value as string,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set the image preview
      };
      reader.readAsDataURL(file);

      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        discountImage: file.name, // Save the file name or path
      }));
    }
  };

  const validate = (): boolean => {
    try {
      const schema = discountId ? updateDiscountSchema : baseDiscountSchema;
      schema.parse(discount);
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const formattedErrors = e.format();
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('codeName', discount.codeName);
    formData.append('expiryDate', discount.expiryDate);
    formData.append('discountType', discount.discountType);
    formData.append('usageLimit', discount.usageLimit);
    formData.append('discountValue', discount.discountValue.toString()); // Convert number to string
    formData.append('description', discount.description);
    formData.append('status', discount.status);
    if (imageFile) formData.append('discountImage', imageFile);

    try {
      const method = discount.id ? 'put' : 'post';
      const url = discount.id ? `/discount/${discount.id}` : '/discount';

      await axiosInstance({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/dashboard/discount');
    } catch (error) {
      console.error('Error saving discount:', error);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{discountId ? 'Edit Discount' : 'Create Discount'}</Typography>

      <TextField
        label="Code Name"
        name="codeName"
        value={discount.codeName}
        onChange={handleInputChange}
        fullWidth
        error={!!errors.codeName}
        helperText={errors.codeName?.message}
      />

      <TextField
        label="Expiry Date"
        name="expiryDate"
        type="date"
        value={discount.expiryDate}
        onChange={handleInputChange}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        error={!!errors.expiryDate}
        helperText={errors.expiryDate?.message}
      />

      <Select
        label="Discount Type"
        name="discountType"
        value={discount.discountType}
        onChange={handleSelectChange}
        fullWidth
        error={!!errors.discountType}
        helperText={errors.discountType?.message}
      >
        <MenuItem value={DiscountType.Percentage}>Percentage</MenuItem>
        <MenuItem value={DiscountType.Fix}>Fixed Amount</MenuItem>
      </Select>

      <Select
        label="Usage Limit"
        name="usageLimit"
        value={discount.usageLimit}
        onChange={handleSelectChange}
        fullWidth
        error={!!errors.usageLimit}
        helperText={errors.usageLimit?.message}
      >
        <MenuItem value={UsageLimit.Once}>Once</MenuItem>
        <MenuItem value={UsageLimit.Twice}>Twice</MenuItem>
        <MenuItem value={UsageLimit.NoLimit}>No Limit</MenuItem>
      </Select>

      <TextField
        label="Discount Value"
        name="discountValue"
        type="number"
        value={discount.discountValue}
        onChange={handleInputChange}
        fullWidth
        error={!!errors.discountValue}
        helperText={errors.discountValue?.message}
      />

      <TextField
        label="Description"
        name="description"
        value={discount.description}
        onChange={handleInputChange}
        fullWidth
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <Input
        className="input-flie"
        type="file"
        name="discountImage"
        onChange={handleImageChange}
        fullWidth
        error={!!errors.discountImage}
        required={!discountId} // Only required on create, not on update
      />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Discount Preview"
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '16px' }}
        />
      )}
      {errors.discountImage && <Typography color="error">{errors.discountImage.message}</Typography>}

      <Select label="Status" name="status" value={discount.status} onChange={handleSelectChange} fullWidth>
        <MenuItem value={DiscountStatus.Active}>Active</MenuItem>
        <MenuItem value={DiscountStatus.Inactive}>Inactive</MenuItem>
        <MenuItem value={DiscountStatus.Expired}>Expired</MenuItem>
      </Select>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button className="common-button" type="submit" variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button className="common-button" variant="contained" onClick={() => router.push('/dashboard/discount')}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
