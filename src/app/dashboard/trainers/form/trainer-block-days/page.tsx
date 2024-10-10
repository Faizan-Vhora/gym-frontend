'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateFormat } from '@/utils/constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormControl, FormHelperText, Grid, IconButton, Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

// Define the Zod schema
const dateRangeSchema = z.object({
  unavailableDates: z.array(
    z.object({
      startDate: z.string().nonempty('Start date cannot be empty'),
      endDate: z.string().nonempty('End date cannot be empty'),
    })
  ),
});

const UnavailableDateRanges = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      unavailableDates: [{ startDate: '', endDate: '' }],
    },
  });

  interface UnavailableDate {
    startDate: string; // assuming you are storing dates as strings
    endDate: string; // assuming you are storing dates as strings
  }

  interface FormData {
    unavailableDates: UnavailableDate[]; // Ensure this is defined correctly
  }

  const unavailableDates = watch('unavailableDates');

  const addDateRange = () => {
    setValue('unavailableDates', [...unavailableDates, { startDate: '', endDate: '' }]);
  };

  const removeDateRange = (index: number) => {
    const newDates = [...unavailableDates];
    newDates.splice(index, 1);
    setValue('unavailableDates', newDates);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      trainerBlockDates: data.unavailableDates.map((dateRange) => ({
        startDate: dayjs(dateRange.startDate).format(DateFormat.dateFormat),
        endDate: dayjs(dateRange.endDate).format(DateFormat.dateFormat),
      })),
    };
    try {
      await axiosInstance.put(`/trainer/${id}/trainer-block-dates`, payload);
      toast.success('Block Dates saved successfully!');
      router.push('/dashboard/trainers'); // Adjust the redirect as needed
    } catch (error) {
      toast.error('An error occurred while saving the block dates.');
    }
  };

  // Fetch existing unavailable dates on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/trainer/${id}/trainer-block-dates`);
        const existingDates: UnavailableDate[] = response.data.data; // Explicitly define the type
        if (existingDates.length > 0) {
          // Set the form values with the existing dates
          setValue('unavailableDates', existingDates);
        }
      } catch (error) {
        toast.error('Failed to load unavailable dates.');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, [id, setValue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {isLoading ? (
        <p>Loading...</p> // Show loading state
      ) : (
        <form style={{ marginTop: '40px' }} onSubmit={handleSubmit(onSubmit)}>
          {unavailableDates.map((dateRange, index) => (
            <Grid container alignItems={'center'} key={index} sx={{ marginLeft: '5px' }}>
              <Grid item xs={12} sm={6} md={4} sx={{ padding: '15px' }}>
                <FormControl fullWidth>
                  <Controller
                    name={`unavailableDates.${index}.startDate`} // Correct the name
                    control={control}
                    render={({ field, fieldState: { error: fieldError } }) => (
                      <DatePicker
                        disablePast
                        format="MM-DD-YYYY"
                        views={['year', 'month', 'day']}
                        label="Start Date"
                        value={dateRange.startDate ? dayjs(dateRange.startDate) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '');
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(fieldError),
                            helperText: fieldError ? fieldError.message : '',
                          },
                        }}
                      />
                    )}
                  />
                  {errors?.unavailableDates?.[index]?.startDate && (
                    <FormHelperText>{errors.unavailableDates[index].startDate.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4} sx={{ padding: '15px' }}>
                <FormControl fullWidth>
                  <Controller
                    name={`unavailableDates.${index}.endDate`} // Correct the name
                    control={control}
                    render={({ field, fieldState: { error: fieldError } }) => (
                      <DatePicker
                        disablePast
                        format="MM-DD-YYYY"
                        views={['year', 'month', 'day']}
                        label="End Date"
                        value={dateRange.endDate ? dayjs(dateRange.endDate) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '');
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(fieldError),
                            helperText: fieldError ? fieldError.message : '',
                          },
                        }}
                      />
                    )}
                  />
                  {errors?.unavailableDates?.[index]?.endDate && (
                    <FormHelperText>{errors.unavailableDates[index].endDate.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <IconButton
                  onClick={() => {
                    removeDateRange(index);
                  }}
                  color="error"
                >
                  <Trash />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Stack className="trainerbtn" alignItems={'end'} flexDirection={'row'} justifyContent={'end'} padding={5}>
            <Button
              variant="outlined"
              onClick={addDateRange}
              style={{ marginTop: '16px' }}
              sx={{
                borderColor: '#d0021b',
                color: '#d0021b',
                marginLeft: '15px',
                transform: 'skewX(-20deg)',
                '&:hover': {
                  borderColor: 'darkred',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                },
              }}
            >
              + Add Another Date Range
            </Button>

            <Button
              type="submit"
              className="common-button"
              variant="contained"
              style={{ marginTop: '16px', marginLeft: '16px' }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      )}
    </LocalizationProvider>
  );
};

export default UnavailableDateRanges;
