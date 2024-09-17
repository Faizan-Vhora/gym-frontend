'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
} from '@mui/material';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import { useForm } from 'react-hook-form'; // Import useForm here

import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

export default function MembershipPlanEditForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [membershipPlan, setMembershipPlans] = useState<MembershipPlanFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const MembershipPlanSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    cost: z.coerce.number().min(1, 'Cost is required'),
    durationInMonths: z.coerce
      .number()
      .min(1, 'Duration must be at least 1 month')
      .max(12, 'Duration cannot be more than 12 months'),
    description: z.string().optional(),
    paymentFrequency: z.string(),
    status: z.string().optional(),
  });

  type MembershipPlanFormInputs = z.infer<typeof MembershipPlanSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MembershipPlanFormInputs>({
    resolver: zodResolver(MembershipPlanSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: MembershipPlanFormInputs }>(`/membership-types/${id}`)
        .then((response) => {
          setMembershipPlans(response.data.data);
        })
        .catch((err: unknown) => {
          let errorMessage: string;
          if (typeof err === 'string') {
            errorMessage = err;
          } else {
            errorMessage = 'An unexpected error occurred';
          }
          toast.error(errorMessage);
        });
    }
  }, [id]);

  useEffect(() => {
    if (membershipPlan) {
      setValue('title', membershipPlan.title);
      setValue('cost', membershipPlan.cost);
      setValue('durationInMonths', membershipPlan.durationInMonths);
      setValue('description', membershipPlan.description || '');
      setValue('paymentFrequency', membershipPlan.paymentFrequency);
      setValue('status', membershipPlan.status || '');
    }
  }, [membershipPlan, setValue]);

  const onSubmit = async (data: MembershipPlanFormInputs): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/membership-types/${id}` : '/membership-types';

      await axiosInstance({
        method,
        url,
        data,
      });

      toast.success('Membership Type saved successfully');

      router.push('/dashboard/membership-plan');
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
      setError('Failed to save Membership Type details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!membershipPlan && id) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={id ? 'Edit Membership Plan' : 'Create Membership Plan'} />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Grid container spacing={10}>
              <Grid item md={12} xs={12} marginTop={3}>
                <Grid container spacing={10}>
                  <Grid item md={12} xs={12}>
                    <Grid container spacing={4}>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth required>
                          <InputLabel>Title</InputLabel>
                          <OutlinedInput {...register('title')} label="title" error={Boolean(errors.title)} />
                          {errors.title?.message && <FormHelperText error>{errors.title.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth required>
                          <InputLabel>Cost</InputLabel>
                          <OutlinedInput
                            {...register('cost')}
                            label="cost"
                            type="number"
                            error={Boolean(errors.cost)}
                          />
                          {errors.cost?.message && <FormHelperText error>{errors.cost.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth required>
                          <InputLabel>Duration in Months</InputLabel>
                          <OutlinedInput
                            {...register('durationInMonths')}
                            label="Duration in Months"
                            type="number"
                            error={Boolean(errors.durationInMonths)}
                          />
                          {errors.durationInMonths?.message && (
                            <FormHelperText error>{errors.durationInMonths.message}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item md={6} p={2}>
                        <FormControl fullWidth>
                          <InputLabel>Payment Frequency</InputLabel>
                          <OutlinedInput
                            {...register('paymentFrequency')}
                            label="Payment Frequency"
                            error={Boolean(errors.paymentFrequency)}
                          />
                          {errors.paymentFrequency?.message && (
                            <FormHelperText>{errors.paymentFrequency.message}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item md={12} p={2}>
                        <FormControl fullWidth>
                          <TextField
                            {...register('description')}
                            label="Description"
                            error={Boolean(errors.description)}
                            helperText={errors.description?.message}
                            multiline
                            rows={4} // Increase the number of rows here
                            variant="outlined"
                            fullWidth
                          />
                          {errors.description?.message && (
                            <FormHelperText error>{errors.description.message}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" p={3}>
          <Button className="common-button" variant="contained" disabled={isSubmitting} type="submit">
            {id ? 'Update' : 'Save'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              router.push('/dashboard/membership-plan');
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
        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
