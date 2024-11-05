'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import { REGEX_VALIDATION } from '@/utils/constant';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z, ZodError } from 'zod';
import type { ZodFormattedError } from 'zod';

import axiosInstance from '@/lib/axios';
import type { DiscountEntry, DiscountEntryResponse } from '@/components/admin/discount/discount-table';
import { DiscountStatus, DiscountType } from '@/components/admin/discount/discount-table';

// Validation schemas
const baseDiscountSchema = z.object({
  codeName: z
    .string()
    .regex(REGEX_VALIDATION.PROMOCODE, 'Promo code must be 5-10 characters long. Cannot contain special characters.')
    .transform((val) => val.toUpperCase()),
  startDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  discountType: z.nativeEnum(DiscountType, { errorMap: () => ({ message: 'Discount Type is required' }) }),
  usageLimit: z.number(),
  minimumPurchaseAmount: z.number(),
  discountValue: z.number().min(1, 'Discount Value must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  discountImage: z.string().min(1, 'Discount Image is required'),
  status: z.nativeEnum(DiscountStatus).optional(),
  isNewUser: z.boolean().optional(),
  membershipType: z.array(z.number().nullable().optional()),
});

const updateDiscountSchema = baseDiscountSchema.partial().extend({
  discountImage: z.string().optional(),
});

type DiscountSchema = z.infer<typeof baseDiscountSchema>;

export default function DiscountFormPage(): React.JSX.Element {
  const [discount, setDiscount] = React.useState<DiscountEntry>({
    id: 0,
    codeName: '',
    startDate: '',
    expiryDate: '',
    discountType: DiscountType.Percentage,
    membershipType: [],
    hasUsageLimit: false,
    usageLimit: 0,
    hasMinimumAmount: false,
    minimumPurchaseAmount: 0,
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
  const [startDateClear, setStartDateClear] = React.useState<boolean>(false);
  const [endDateClear, setEndDateClear] = React.useState<boolean>(false);
  const [hasUsageLimit, setHasUsageLimit] = React.useState<boolean>(false);
  const [hasMinimumAmount, setHasMinimumAmount] = React.useState<boolean>(false);
  const [plans, setPlans] = React.useState<MembershipPlans[]>([]);
  const [membershipTypeId, setMembershipTypeId] = React.useState<number[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const discountId = searchParams.get('id');

  const { control, handleSubmit } = useForm<DiscountSchema>();

  React.useEffect(() => {
    if (discountId) {
      axiosInstance
        .get<{ data: DiscountEntryResponse }>(`/discount/${discountId}`)
        .then((response) => {
          const data: DiscountEntryResponse = response.data.data;
          if (typeof data.discountValue === 'string') {
            data.discountValue = parseFloat(data.discountValue);
          }

          setDiscount({
            id: data.id,
            codeName: data.codeName,
            startDate: data.startDate,
            expiryDate: data.expiryDate,
            discountType: data.discountType,
            membershipType: Array.isArray(data.discountMembershipTypes)
              ? data.discountMembershipTypes.map((item) => item.membershipType.id) // Map to membershipType ids
              : [], // Default to an empty array if discountMembershipTypes is not an array
            hasUsageLimit: data.hasUsageLimit,
            usageLimit: data.usageLimit,
            hasMinimumAmount: data.hasMinimumAmount,
            minimumPurchaseAmount: data.minimumPurchaseAmount,
            discountValue: data.discountValue,
            description: data.description,
            status: data.status,
            isNewUser: data.isNewUser,
            discountImageUrl: data.discountImageUrl || '',
          });

          if (data.discountImageUrl) {
            setImagePreview(data.discountImageUrl);
          }
          if (data.hasUsageLimit) {
            setHasUsageLimit(data.hasUsageLimit);
          }
          if (data.hasMinimumAmount) {
            setHasMinimumAmount(data.hasMinimumAmount);
          }
          if (data.discountMembershipTypes) {
            setMembershipTypeId(data.discountMembershipTypes.map((membership) => membership.membershipType.id));
          }
        })
        .catch((error: unknown) => {
          error instanceof Error ? error.message : 'An unexpected error occurred';
        });
    }
  }, [discountId]);

  const handleStartDateChange = (newValue: Dayjs | null): void => {
    if (newValue) {
      // Set the date when a valid date is selected
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        startDate: newValue.format('YYYY-MM-DD'),
      }));
    } else {
      // Set startDate to null when the date is cleared
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        startDate: '',
      }));
    }
  };

  const handleExpiryChange = (newValue: Dayjs | null): void => {
    if (newValue) {
      // Set the date when a valid date is selected
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        expiryDate: newValue.format('YYYY-MM-DD'),
      }));
    } else {
      // Set expiryDate to null when the date is cleared
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        expiryDate: '',
      }));
    }
  };

  interface MembershipPlans {
    id: number;
    title: string;
    cost: number;
    durationInMonths: number;
    expiryDate: Date;
    paymentFrequency: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    status: string;
  }

  interface MembershipPlanResponse {
    data: MembershipPlans[];
  }

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get<MembershipPlanResponse>('/membership-types/dropdown');
        setPlans(response.data.data);
        setLoading(true);
      } catch (err: unknown) {
        err instanceof Error ? err.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };
    void fetchPlans();
  }, []);

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
    if (file) {
      const fileType = file.type;

      // Check if the file type starts with 'image/'
      if (!fileType.startsWith('image/')) {
        void Swal.fire('Please select a valid Image');
        return;
      }
    }
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

  const handleMembershipTypeChange = (membershipId: number[]): void => {
    setMembershipTypeId(membershipId);
  };

  const validate = (): boolean => {
    try {
      const schema = discountId ? updateDiscountSchema : baseDiscountSchema;

      // Convert values to proper types
      discount.discountValue = Number(discount.discountValue);
      discount.usageLimit = Number(discount.usageLimit);
      discount.minimumPurchaseAmount = Number(discount.minimumPurchaseAmount);
      if (Array.isArray(membershipTypeId)) {
        discount.membershipType = membershipTypeId.map(Number); // Convert to an array of numbers
      }

      // Check if startDate is greater than expiryDate
      const startDate = new Date(discount.startDate);
      const expiryDate = new Date(discount.expiryDate);

      if (startDate > expiryDate) {
        void Swal.fire({
          icon: 'error',
          title: 'Invalid Dates',
          text: 'The start date cannot be later than the expiry date.',
        });
        return false; // Return false to stop further validation
      }

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

    if (Array.isArray(discount.membershipType) && discount.membershipType.length > 0) {
      formData.append('membershipType', JSON.stringify(discount.membershipType)); // Send as JSON string
    }

    formData.append('expiryDate', discount.expiryDate || '');
    formData.append('startDate', discount.startDate || '');
    formData.append('discountType', discount.discountType as string); // Ensure proper typing
    if (hasUsageLimit) {
      formData.append('usageLimit', discount.usageLimit.toString()); // Ensure proper typing
      formData.append('hasUsageLimit', hasUsageLimit.toString()); // Ensure proper typing
    }
    if (hasMinimumAmount) {
      formData.append('minimumPurchaseAmount', discount.minimumPurchaseAmount.toString()); // Ensure proper typing
      formData.append('hasMinimumAmount', hasMinimumAmount.toString()); // Ensure proper typing
    }
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

      router.push('/admin/discount');
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false); // End loading state
    }
  };

  React.useEffect(() => {
    if (endDateClear) {
      const timeout = setTimeout(() => {
        setEndDateClear(false);
      }, 1500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return;
  }, [endDateClear]);

  React.useEffect(() => {
    if (startDateClear) {
      const timeout = setTimeout(() => {
        setStartDateClear(false);
      }, 1500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return;
  }, [startDateClear]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          title={discountId ? 'Edit Discount' : 'Create Discount'}
        />
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
                  <Button
                    component="label"
                    fullWidth
                    variant="text"
                    style={{ fontFamily: 'Audiowide, sans-serif !important' }}
                  >
                    Upload picture
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                  {imagePreview && (
                    <Stack spacing={1} mt={2}>
                      <img
                        src={imagePreview || '/assets/logo.svg'}
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
                <Grid item sm={6} xs={12}>
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
                  <Controller
                    control={control}
                    name="membershipType"
                    defaultValue={membershipTypeId || []} // Set initial value with membershipTypeId array or empty array
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors?.membershipType)}>
                        <Autocomplete
                          multiple // Enable multiple selection
                          options={[{ id: null, title: 'ALL' }, ...plans]} // Add the "ALL" option at the beginning
                          getOptionLabel={(option) => option?.title || ''}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={
                            field.value?.length > 0
                              ? plans.filter((plan) => field.value.includes(plan.id)) // Filter plans based on selected IDs
                              : membershipTypeId?.map((id) => plans.find((plan) => plan.id === id)).filter(Boolean) ||
                                [] // Show selected plans based on IDs
                          }
                          onChange={(e, value) => {
                            // Convert selected options to an array of IDs, excluding 'ALL'
                            const membershipTypeIds = value
                              .map((item) => item?.id)
                              .filter((id) => id !== null) as number[]; // Cast to number[]
                            field.onChange(membershipTypeIds);
                            handleMembershipTypeChange(membershipTypeIds);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Membership Plan" error={Boolean(errors?.membershipType)} />
                          )}
                        />
                        {errors?.membershipType && <FormHelperText>{errors.membershipType?._errors[0]}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                  {/* <Controller
                    control={control}
                    name="membershipType"
                    // defaultValue={membershipTypeId}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors?.membershipType)}>
                        <Autocomplete
                          options={[{ id: null, title: 'ALL' }, ...plans]} // Add the "ALL" option at the beginning
                          getOptionLabel={(option) => option.title || ''}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={plans.find((plan) => plan.id === membershipTypeId) || { id: null, title: 'ALL' }} // Default "ALL" selection
                          onChange={(e, value) => {
                            const membershipType = value ? Number(value.id) : null; // Get the selected option's idcted
                            field.onChange(membershipType);
                            handleMembershipTypeChange(membershipType);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Membership Plan" error={Boolean(errors?.membershipType)} />
                          )}
                        />
                        {errors?.membershipType && <FormHelperText>{errors.membershipType?._errors[0]}</FormHelperText>}
                      </FormControl>
                    )}
                  /> */}
                </Grid>

                <Grid item md={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormControl fullWidth error={Boolean(errors?.startDate)}>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field, fieldState }) => {
                          const errorMessage = fieldState.error ? fieldState.error.message : '';

                          return (
                            <DatePicker
                              disablePast
                              format="MM-DD-YYYY"
                              views={['year', 'month', 'day']}
                              defaultValue={discount?.startDate ? dayjs(discount.startDate) : null}
                              label="Start Date"
                              value={discount?.startDate ? dayjs(discount.startDate) : null}
                              onChange={(newValue: Dayjs | null) => {
                                if (newValue) {
                                  field.onChange(newValue.format('YYYY-MM-DD'));
                                } else {
                                  field.onChange(null); // Clear value when date is cleared
                                }
                                handleStartDateChange(newValue); // Update field.onChange
                              }}
                              slotProps={{
                                field: {
                                  clearable: true,
                                  onClear: () => {
                                    setStartDateClear(true);
                                  },
                                },
                                textField: {
                                  fullWidth: true,
                                  helperText: errorMessage,
                                },
                              }}
                            />
                          );
                        }}
                      />
                      {errors?.startDate && <FormHelperText error>{errors.startDate._errors[0]}</FormHelperText>}
                    </FormControl>
                  </LocalizationProvider>
                </Grid>
                <Grid item md={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormControl fullWidth error={Boolean(errors?.expiryDate)}>
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
                              minDate={dayjs(discount.startDate).isValid() ? dayjs(discount.startDate) : undefined} // Ensure minDate is set
                              onChange={(newValue: Dayjs | null) => {
                                if (newValue) {
                                  field.onChange(newValue.format('YYYY-MM-DD'));
                                } else {
                                  field.onChange(null); // Clear value when date is cleared
                                }
                                handleExpiryChange(newValue); // Update field.onChange
                              }}
                              slotProps={{
                                field: {
                                  clearable: true,
                                  onClear: () => {
                                    setEndDateClear(true);
                                  },
                                },
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
                <Grid item xs={12} sm={6}>
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

                <Grid item sm={6} xs={12}>
                  <FormControl variant="outlined" fullWidth required error={Boolean(errors?.discountType)}>
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

                <Grid item xs={12} md={12}>
                  <Grid container>
                    <Grid item md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hasUsageLimit}
                            onChange={() => {
                              setHasUsageLimit(!hasUsageLimit);
                            }}
                          />
                        }
                        label="Usage Limit ?"
                      />
                    </Grid>
                    <Grid item md={6}>
                      {hasUsageLimit && (
                        <FormControl variant="outlined" fullWidth required error={Boolean(errors?.usageLimit)}>
                          <TextField
                            required
                            label="Usage Limit"
                            name="usageLimit"
                            value={discount.usageLimit}
                            onChange={handleInputChange}
                            fullWidth
                            error={Boolean(errors?.usageLimit)}
                          />
                          <FormHelperText>{errors?.usageLimit?._errors[0]}</FormHelperText>
                        </FormControl>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={12}>
                  <Grid container>
                    <Grid item md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hasMinimumAmount}
                            onChange={() => {
                              setHasMinimumAmount(!hasMinimumAmount);
                            }}
                          />
                        }
                        label="Minimum Purchase Amount ?"
                      />
                    </Grid>
                    <Grid item md={6}>
                      {hasMinimumAmount && (
                        <FormControl
                          variant="outlined"
                          fullWidth
                          required
                          error={Boolean(errors?.minimumPurchaseAmount)}
                        >
                          <TextField
                            required
                            label="Minimum Amount"
                            name="minimumPurchaseAmount"
                            value={discount.minimumPurchaseAmount}
                            onChange={handleInputChange}
                            fullWidth
                            error={Boolean(errors?.minimumPurchaseAmount)}
                          />
                          <FormHelperText>{errors?.minimumPurchaseAmount?._errors[0]}</FormHelperText>
                        </FormControl>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={12}>
                  <TextField
                    required
                    label="Description"
                    name="description"
                    value={discount.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                    error={Boolean(errors?.description)}
                    helperText={errors?.description?._errors[0]}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
                <Button
                  type="submit"
                  variant="contained"
                  className="common-button"
                  disabled={loading}
                  style={{ fontFamily: 'Audiowide, sans-serif !important' }}
                >
                  {discountId ? 'Update Discount' : 'Save Discount'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push('/admin/discount');
                  }}
                  sx={{
                    borderColor: '#d0021b',
                    color: '#d0021b',
                    fontFamily: 'Audiowide, sans-serif !important',
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
