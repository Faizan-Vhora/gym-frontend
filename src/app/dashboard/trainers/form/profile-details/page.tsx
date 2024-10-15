'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import { ExpertiseEntry } from '@/components/dashboard/expertise/expertise-table';

// Define validation schemas
const TrainerSchema = z.object({
  experience: z.coerce
    .number()
    .optional()
    .refine((value) => value === undefined || value <= 99999, {
      message: 'Experience must be at most 5 digits.',
    }),
  aboutMe: z.string().nullable(),
  fees: z.coerce
    .number()
    .optional()
    .refine((value) => value === undefined || value <= 99999, {
      message: 'Fees must be at most 5 digits.',
    }),
});

type TrainerFormInputs = z.infer<typeof TrainerSchema>;

const TrainerAdditionalForm: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [_trainer, setTrainer] = useState<TrainerFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedExpertise, setSelectedExpertise] = useState<number[]>([]);
  const [expertiseList, setExpertiseList] = useState<ExpertiseEntry[]>([]);
  const [redirectTo, setRedirectTo] = useState<'trainers' | 'banner-images'>('trainers');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrainerFormInputs>({
    resolver: zodResolver(TrainerSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    const fetchTrainerData = async () => {
      if (id) {
        setLoading(true);
        try {
          // First API call to get trainer expertise
          const expertiseResponse = await axiosInstance.get<{ data: { trainerExpertise: ExpertiseEntry[] } }>(
            `/users/detail/trainer-profile/${id}`
          );
          const expertiseData = expertiseResponse.data.data;
          setSelectedExpertise(expertiseData.trainerExpertise.map((exp: ExpertiseEntry) => exp.id)); // Extracting IDs

          // Second API call to get trainer details
          const trainerResponse = await axiosInstance.get<{ data: TrainerFormInputs }>(`/users/${id}`, {
            params: { userType: 2 },
          });
          const trainerData = trainerResponse.data.data; // Explicit typing here
          setTrainer(trainerData);

          // Set form values if data is received
          setValue('experience', trainerData.experience);
          setValue('aboutMe', trainerData.aboutMe);
          setValue('fees', trainerData.fees);
        } catch (err) {
          err instanceof Error ? err.message : 'An unexpected error occurred';
        } finally {
          setLoading(false);
        }
      }
    };
    void fetchTrainerData();
  }, [id, setValue]);

  useEffect(() => {
    const fetchExpertise = async (): Promise<void> => {
      try {
        const response = await axiosInstance.get<{ data: ExpertiseEntry[] }>('/expertise/dropdown');
        setExpertiseList(response.data.data); // Now TypeScript knows the structure of `response.data`
      } catch (err) {
        toast.error('An unexpected error occurred');
      }
    };

    void fetchExpertise();
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const expertiseId = parseInt(event.target.value, 10); // Rename to `expertiseId`
    setSelectedExpertise(
      (prev) => (event.target.checked ? [...prev, expertiseId] : prev.filter((expertise) => expertise !== expertiseId)) // Rename filter variable
    );
  };

  const onSubmit = async (data: TrainerFormInputs, destination: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.put(`/users/update/trainer-profile/${id}`, {
        expertiseIds: selectedExpertise,
        ...data,
      });
      toast.success('Profile updated successfully!');

      if (destination === 'trainers') {
        router.push('/dashboard/trainers');
      } else if (destination === 'banner-images') {
        router.push(`/dashboard/trainers/form/banner-images?id=${id}`);
      }
    } catch (err) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
      setError('Failed to save Trainer details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, redirectTo))}>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Profile Details" />
        <Divider />
        <CardContent>
          <Grid container spacing={8}>
            {/* Expertise List */}
            <Grid item md={5} xs={12}>
              <Typography>Expertise</Typography>
              <FormControl fullWidth>
                <Box
                  sx={{
                    maxHeight: 200, // Adjust this value based on your layout
                    overflowY: 'auto',
                    border: '1px solid #ccc', // Optional: Adds a border around the scrollable area
                    borderRadius: '4px', // Optional: Adds rounded corners
                    padding: '8px', // Optional: Adds some padding inside the box
                  }}
                >
                  {expertiseList.length > 0 && (
                    <Stack spacing={1}>
                      {expertiseList.map((expertise) => (
                        <FormControlLabel
                          key={expertise.id}
                          control={
                            <Checkbox
                              value={expertise.id}
                              checked={selectedExpertise.includes(expertise.id)}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={expertise?.title}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </FormControl>
            </Grid>
            <Grid item md={7} xs={12}>
              <Grid container spacing={2}>
                {/* Experience Selector */}
                <Grid item md={6} xs={12}>
                  <FormControl required fullWidth error={Boolean(errors.experience)}>
                    <InputLabel htmlFor="experience">Experience (Years)</InputLabel>
                    <OutlinedInput
                      id="experience"
                      {...register('experience')}
                      label="Experience (Years)"
                      error={Boolean(errors.experience)}
                    />
                    {errors.experience?.message && <FormHelperText error>{errors.experience.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                {/* Fees Field */}
                <Grid item md={6} xs={12}>
                  <FormControl required fullWidth error={Boolean(errors.fees)}>
                    <InputLabel htmlFor="fees">Fees</InputLabel>
                    <OutlinedInput
                      id="fees"
                      type="number"
                      {...register('fees')}
                      label="Fees"
                      error={Boolean(errors.fees)}
                      startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    />
                    {errors.fees?.message && <FormHelperText error>{errors.fees.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                {/* About Me Field */}
                <Grid item md={12} xs={12}>
                  <TextField
                    {...register('aboutMe')}
                    label="About Me"
                    error={Boolean(errors.aboutMe)}
                    helperText={errors.aboutMe?.message}
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end', padding: '15px 30px' }}>
          <Button
            className="common-button"
            variant="contained"
            onClick={() => {
              setRedirectTo('trainers');
            }}
            type="submit"
            disabled={isSubmitting}
          >
            Save
          </Button>
          <Button
            className="common-button"
            variant="contained"
            type="submit"
            onClick={() => {
              setRedirectTo('banner-images');
            }}
            disabled={isSubmitting}
          >
            Save and next
          </Button>
          <Button
            className="common-button"
            variant="outlined"
            onClick={() => {
              router.push('/dashboard/trainers');
            }}
          >
            Cancel
          </Button>
        </CardActions>
      </Card>
      {error && <Alert color="error">{error}</Alert>}
      <ToastContainer />
    </Box>
  );
};

export default TrainerAdditionalForm;
