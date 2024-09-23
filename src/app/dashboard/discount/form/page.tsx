'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import type { ZodFormattedError } from 'zod';

import axiosInstance from '@/lib/axios';
import type { DiscountEntry } from '@/components/dashboard/discount/discount-table';
import { DiscountStatus, DiscountType, UsageLimit } from '@/components/dashboard/discount/discount-table';

// Validation schemas
const baseDiscountSchema = z.object({
  codeName: z
    .string()
    .regex(
      /^[A-Z0-9][A-Z0-9-_]{4,9}$/,
      'Promo code must be 5-10 characters long, and can only contain letters, numbers, hyphens, and underscores.'
    )
    .transform((val) => val.toUpperCase()),
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
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const discountId = searchParams.get('id');

  const { control, handleSubmit } = useForm<DiscountSchema>();

  // const handleRemoveImage = () => {
  //   setImagePreview(null);
  //   setImageFile(null);
  //   setDiscount((prevDiscount) => ({
  //     ...prevDiscount,
  //     discountImage: '', // Or null if you prefer
  //   }));
  // };

  React.useEffect(() => {
    if (discountId) {
      axiosInstance
        .get<{ data: DiscountEntry }>(`/discount/${discountId}`)
        .then((response) => {
          const data: DiscountEntry = response.data.data;
          if (typeof data.discountValue === 'string') {
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
        .catch((error: unknown) => {
          let errorMessage = 'An unexpected error occurred';
          if (error instanceof Error) {
            errorMessage = `An unexpected error occurred: ${error.message}`;
          }
          toast.error(errorMessage);
        });
    }
  }, [discountId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [name]: name === 'discountValue' ? Number(value) : value,
    }));
    if (name === 'codeName') {
      setDiscount((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      setDiscount((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>): void => {
    const { name, value } = e.target;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [name as keyof DiscountEntry]: value as string,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
        discountImage: file.name, // Adjust based on your requirements
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validate = (): boolean => {
    try {
      const schema = discountId ? updateDiscountSchema : baseDiscountSchema;
      discount.discountValue = Number(discount.discountValue);
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

  const onSubmit = async (): Promise<void> => {
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
    setLoading(true); // Start loading state
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
    } catch (err) {
      let _errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        _errorMessage = err.message;
      } else {
        _errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      // Optionally handle or log the error
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={discountId ? 'Edit Discount' : 'Create Discount'} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Card
                sx={{
                  marginBottom: '40px',
                }}
              >
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <Button component="label" fullWidth variant="text">
                    Upload picture
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                  {imagePreview && (
                    <Stack spacing={1} mt={2}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '1rem' }}
                      />
                    </Stack>
                  )}
                  {errors?.discountImage && <FormHelperText error>{errors?.discountImage?._errors[0]}</FormHelperText>}
                </CardContent>
              </Card>
            </Grid>

            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    required
                    label="Code Name"
                    name="codeName"
                    value={discount.codeName}
                    onChange={handleInputChange}
                    fullWidth
                    error={Boolean(errors?.codeName)}
                    helperText={errors?.codeName?._errors[0]}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormControl fullWidth required>
                      <Controller
                        name="expiryDate"
                        control={control}
                        render={({ field, fieldState }) => {
                          const errorMessage = fieldState.error ? fieldState.error.message : '';

                          return (
                            <DatePicker
                              disablePast
                              format="MM-DD-YYYY"
                              views={['year', 'month', 'day']}
                              defaultValue={discount?.expiryDate ? dayjs(discount.expiryDate) : null}
                              label="Expiry Date"
                              value={discount?.expiryDate ? dayjs(discount.expiryDate) : null}
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
                      {errors?.expiryDate && <FormHelperText error>{errors.expiryDate._errors[0]}</FormHelperText>}
                    </FormControl>
                  </LocalizationProvider>
                </Grid>

                <Grid item md={6} xs={12}>
                  <FormControl variant="outlined" fullWidth required>
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
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth required>
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="Discount Value"
                    name="discountValue"
                    type="number"
                    value={discount.discountValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;

                      // Ensure the value is non-negative before updating state
                      if (Number(value) >= 0) {
                        handleInputChange(e); // Call your existing input change handler
                      }
                    }}
                    fullWidth
                    error={Boolean(errors?.discountValue)}
                    helperText={errors?.discountValue?._errors[0]}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={discount.description}
                    onChange={handleInputChange}
                    fullWidth
                    error={Boolean(errors?.description)}
                    helperText={errors?.description?._errors[0]}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
                <Button type="submit" variant="contained" className="common-button" disabled={loading}>
                  {discountId ? 'Update Discount' : 'Save Discount'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push('/dashboard/discount');
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
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <ToastContainer />
        </CardActions>
      </Card>
    </form>
  );
}
