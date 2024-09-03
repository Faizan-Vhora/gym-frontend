'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { z, ZodError } from 'zod';
import type { ZodFormattedError } from 'zod';

import axiosInstance from '@/lib/axios';
import type { DiscountEntry } from '@/components/dashboard/discount/discount-table';
import { DiscountStatus, DiscountType, UsageLimit } from '@/components/dashboard/discount/discount-table';

// Validation schemas
const baseDiscountSchema = z.object({
  codeName: z.string().min(1, 'Code Name is required'),
  expiryDate: z.string().min(1, 'Expiry Date is required'),
  discountType: z.nativeEnum(DiscountType, { errorMap: () => ({ message: 'Discount Type is required' }) }),
  usageLimit: z.nativeEnum(UsageLimit, { errorMap: () => ({ message: 'Usage Limit is required' }) }),
  discountValue: z.number().min(1, 'Discount Value must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  discountImage: z.string().min(1, 'Discount Image is required'),
  status: z.nativeEnum(DiscountStatus).optional(),
  isNewUser: z.boolean().optional(),
});

const updateDiscountSchema = baseDiscountSchema.partial().extend({
  discountImage: z.string().optional(),
});

type DiscountSchema = z.infer<typeof baseDiscountSchema>;

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
    discountImageUrl: '',
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<ZodFormattedError<DiscountSchema> | null>(null);

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
          setDiscount({
            ...data,
            discountImage: data.discountImageUrl || '',
          });
          if (data.discountImageUrl) {
            setImagePreview(data.discountImageUrl);
          }
        })
        .catch((error) => console.error('Error fetching discount:', error));
    }
  }, [discountId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [name]: name === 'discountValue' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>): void => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [name as keyof DiscountEntry]: value as string,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        discountImage: file.name,
      }));
    }
  };

  const validate = (): boolean => {
    try {
      const schema = discountId ? updateDiscountSchema : baseDiscountSchema;
      schema.parse(discount);
      setErrors(null); // Clear errors if validation passes
      return true;
    } catch (e) {
      if (e instanceof ZodError) {
        setErrors(e.format());
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('codeName', discount.codeName);
    formData.append('expiryDate', discount.expiryDate);
    formData.append('discountType', discount.discountType as string); // Ensure proper typing
    formData.append('usageLimit', discount.usageLimit as string); // Ensure proper typing
    formData.append('discountValue', discount.discountValue.toString());
    formData.append('description', discount.description);
    formData.append('status', discount.status as string); // Ensure proper typing
    if (imageFile) formData.append('discountImage', imageFile);

    try {
      const method = discount.id ? 'put' : 'post';
      const url = discount.id ? `/discount/${discount.id}` : '/discount';

      await axiosInstance({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/dashboard/discount');
    } catch (error) {
      // console.error('Error saving discount:', error);
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
        error={Boolean(errors?.codeName)}
        helperText={errors?.codeName?._errors[0]}
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
        error={Boolean(errors?.expiryDate)}
        helperText={errors?.expiryDate?._errors[0]}
      />

      <FormControl variant="outlined" fullWidth>
        <InputLabel>Discount Type</InputLabel>
        <Select
          label="Discount Type"
          name="discountType"
          value={discount.discountType}
          onChange={handleSelectChange}
          fullWidth
          error={Boolean(errors?.discountType)}
        >
          <MenuItem value={DiscountType.Percentage}>Percentage</MenuItem>
          <MenuItem value={DiscountType.Fix}>Fixed Amount</MenuItem>
        </Select>
        <FormHelperText>{errors?.discountType?._errors[0]}</FormHelperText>
      </FormControl>

      <FormControl variant="outlined" fullWidth>
        <InputLabel>Usage Limit</InputLabel>
        <Select
          label="Usage Limit"
          name="usageLimit"
          value={discount.usageLimit}
          onChange={handleSelectChange}
          fullWidth
          error={Boolean(errors?.usageLimit)}
        >
          <MenuItem value={UsageLimit.Once}>Once</MenuItem>
          <MenuItem value={UsageLimit.Twice}>Twice</MenuItem>
          <MenuItem value={UsageLimit.NoLimit}>No Limit</MenuItem>
        </Select>
        <FormHelperText>{errors?.usageLimit?._errors[0]}</FormHelperText>
      </FormControl>

      <TextField
        label="Discount Value"
        name="discountValue"
        type="number"
        value={discount.discountValue}
        onChange={handleInputChange}
        fullWidth
        error={Boolean(errors?.discountValue)}
        helperText={errors?.discountValue?._errors[0]}
      />

      <TextField
        label="Description"
        name="description"
        value={discount.description}
        onChange={handleInputChange}
        fullWidth
        error={Boolean(errors?.description)}
        helperText={errors?.description?._errors[0]}
      />

      <Input
        className="input-file"
        type="file"
        name="discountImage"
        onChange={handleImageChange}
        fullWidth
        error={Boolean(errors?.discountImage)}
        required={!discountId} // Only required on create, not on update
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Discount Preview"
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
        />
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={handleSave} variant="contained">
          {discountId ? 'Update Discount' : 'Create Discount'}
        </Button>
      </Stack>
    </Stack>
  );
}
