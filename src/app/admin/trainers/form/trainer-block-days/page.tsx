'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateFormat } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardHeader, Divider, FormControl, FormHelperText, Grid, IconButton, Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

// Define the Zod schema
const dateRangeSchema = z
  .object({
    unavailableDates: z.array(
      z.object({
        startDate: z.string().refine((val) => dayjs(val).isValid(), {
          message: 'Start date is invalid',
        }),
        endDate: z.string().refine((val) => dayjs(val).isValid(), {
          message: 'End date is invalid',
        }),
      })
    ),
  })
  .superRefine((data, ctx) => {
    data.unavailableDates.forEach((dateRange, index) => {
      const { startDate, endDate } = dateRange;

      // Check if endDate is provided and is before the startDate
      if (dayjs(endDate).isBefore(dayjs(startDate))) {
        ctx.addIssue({
          path: ['unavailableDates', index, 'endDate'],
          code: z.ZodIssueCode.custom,
          message: 'End date cannot be earlier than start date',
        });
      }
    });
  });

const UnavailableDateRanges = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [existingDates, setExistingDates] = React.useState<UnavailableDate[]>([]);
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
    const newRanges = data.unavailableDates.map((dateRange) => ({
      startDate: dayjs(dateRange.startDate).format(DateFormat.dateFormat),
      endDate: dayjs(dateRange.endDate).format(DateFormat.dateFormat),
    }));

    try {
      const payload = {
        trainerBlockDates: newRanges,
      };

      await axiosInstance.put(`/trainer/${id}/trainer-block-dates`, payload);
      toast.success('Block Dates saved successfully!');
      router.push('/admin/trainers');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Fetch existing unavailable dates on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get<{ data: UnavailableDate[] }>(`/trainer/${id}/trainer-block-dates`);
        const existingDatesS: UnavailableDate[] = response.data.data; // Explicitly define the type
        setExistingDates(existingDatesS);
        if (existingDatesS.length > 0) {
          // Set the form values with the existing dates
          setValue('unavailableDates', existingDatesS);
        }
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, [id, setValue]);

  return (
    <Card>
      <Grid container>
        <Grid item md={9}>
          <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Block Days" />
        </Grid>
        <Grid item xs={12} sm={6} md={2} sx={{ padding: '15px', display: 'flex', justifyContent: 'end' }}>
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
            +
          </Button>
        </Grid>
      </Grid>
      <Divider />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {isLoading ? (
          <CustomLoader /> // Show loading state
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {unavailableDates.map((dateRange, index) => (
              <Grid container alignItems={'center'} key={index} sx={{ marginLeft: '5px' }}>
                <Grid item xs={12} sm={6} md={4} sx={{ padding: '15px' }}>
                  <FormControl fullWidth>
                    <Controller
                      name={`unavailableDates.${index}.startDate`}
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
                              helperText: fieldError ? fieldError.message : '',
                              error: Boolean(fieldError), // Apply error style based on field error, not on disabled state
                              InputProps: {
                                readOnly: true, // Disable typing in the input field
                              },
                            },
                          }}
                          shouldDisableDate={(date) => {
                            const selectedDate = dayjs(date);
                            return existingDates.some(({ startDate, endDate }) => {
                              const start = dayjs(startDate);
                              const end = dayjs(endDate);
                              return (
                                selectedDate.isSame(start, 'day') ||
                                selectedDate.isSame(end, 'day') ||
                                (selectedDate.isAfter(start, 'day') && selectedDate.isBefore(end, 'day'))
                              );
                            });
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
                  <FormControl fullWidth error={Boolean(errors?.unavailableDates?.[index]?.endDate)}>
                    <Controller
                      name={`unavailableDates.${index}.endDate`} // Correct the name
                      control={control}
                      render={({ field, fieldState: { error: fieldError } }) => (
                        <DatePicker
                          disablePast
                          format="MM-DD-YYYY"
                          views={['year', 'month', 'day']}
                          label="End Date"
                          minDate={dateRange.startDate ? dayjs(dateRange.startDate) : undefined}
                          value={dateRange.endDate ? dayjs(dateRange.endDate) : null}
                          onChange={(newValue) => {
                            field.onChange(newValue ? newValue.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '');
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              helperText: fieldError ? fieldError.message : '',
                              error: Boolean(fieldError),
                              InputProps: {
                                readOnly: true, // Disable typing in the input field
                              },
                            },
                          }}
                          shouldDisableDate={(date) => {
                            // Format the current date to dayjs object
                            const selectedDate = dayjs(date);

                            // Check if the date is within any of the existing date ranges
                            return existingDates.some(({ startDate, endDate }) => {
                              // Convert startDate and endDate to dayjs objects for comparison
                              const start = dayjs(startDate);
                              const end = dayjs(endDate);

                              // Check if the selected date is within the range (inclusive of start and end)
                              return (
                                selectedDate.isSame(start, 'day') ||
                                selectedDate.isSame(end, 'day') ||
                                (selectedDate.isAfter(start, 'day') && selectedDate.isBefore(end, 'day'))
                              );
                            });
                          }}
                        />
                      )}
                    />
                    {errors?.unavailableDates?.[index]?.endDate && (
                      <FormHelperText>{errors.unavailableDates[index].endDate.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2} sx={{ padding: '15px' }}>
                  <IconButton
                    onClick={() => {
                      removeDateRange(index);
                    }}
                    color="error"
                    sx={{ marginTop: '25px' }}
                  >
                    <Trash size={20} />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Stack className="trainerbtn" alignItems={'end'} flexDirection={'row'} justifyContent={'end'} padding={5}>
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
    </Card>
  );
};

export default UnavailableDateRanges;
