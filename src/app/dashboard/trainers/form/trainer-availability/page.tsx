import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Minus, Plus } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

const timeSlotSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date(),
  })
  .refine((data) => (data.endTime ? data.endTime > data.startTime : true), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

const daySchema = z.object({
  isChecked: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
});

const formSchema = z.object({
  days: z.array(daySchema),
});

// Define days of the week
const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface TimeSlot {
  startTime: Date | null;
  endTime: Date | null;
}

interface Day {
  isChecked: boolean;
  timeSlots: TimeSlot[];
}

interface FormData {
  days: Day[];
}

interface ApiTimeSlot {
  weekday: number;
  startTime: string;
  endTime: string;
}

export default function WeekdayTimeSlots() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Correctly destructuring setValue here
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: daysOfWeek.map(() => ({
        isChecked: false,
        timeSlots: [],
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'days' });

  // Handle time slots for each day
  const timeSlotFields = fields.map((day, dayIndex) => {
    const isChecked = watch(`days.${dayIndex}.isChecked`);
    const timeSlots = watch(`days.${dayIndex}.timeSlots`);
    return (
      <Box key={day.id} sx={{ marginBottom: 2 }}>
        <Grid container sx={{ padding: '5px', margin: '25px' }} alignItems="center">
          <Grid item md={2}>
            <FormControlLabel
              control={<Checkbox {...control.register(`days.${dayIndex}.isChecked`)} />}
              label={daysOfWeek[dayIndex].label}
            />
          </Grid>

          {isChecked && (
            <>
              <Grid item md={1}>
                <IconButton
                  onClick={() => {
                    const currentTimeSlots = watch(`days.${dayIndex}.timeSlots`);
                    setValue(`days.${dayIndex}.timeSlots`, [...currentTimeSlots, { startTime: null, endTime: null }]);
                  }}
                >
                  <Plus />
                </IconButton>
              </Grid>
              <Grid item md={9}>
                <Controller
                  name={`days.${dayIndex}.timeSlots`}
                  control={control}
                  render={({ field }) => (
                    <>
                      {field.value.map((slot, slotIndex) => (
                        <Grid container spacing={2} key={slotIndex} alignItems="center">
                          <Grid item xs={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <FormControl fullWidth>
                                <Controller
                                  name={`days.${dayIndex}.timeSlots.${slotIndex}.startTime`}
                                  control={control}
                                  render={({ field, fieldState }) => (
                                    <TimePicker
                                      label="Start Time"
                                      value={field.value ? dayjs(field.value) : null}
                                      onChange={(newValue) => field.onChange(newValue?.toDate() ?? null)}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          error: Boolean(fieldState.error),
                                          helperText: fieldState.error?.message,
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </FormControl>
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <FormControl fullWidth>
                                <Controller
                                  name={`days.${dayIndex}.timeSlots.${slotIndex}.endTime`}
                                  control={control}
                                  render={({ field, fieldState }) => (
                                    <TimePicker
                                      label="End Time"
                                      value={field.value ? dayjs(field.value) : null}
                                      onChange={(newValue) => field.onChange(newValue?.toDate() ?? null)}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          error: Boolean(fieldState.error),
                                          helperText: fieldState.error?.message,
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </FormControl>
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={1}>
                            <IconButton
                              onClick={() => {
                                const currentTimeSlots = watch(`days.${dayIndex}.timeSlots`);
                                setValue(
                                  `days.${dayIndex}.timeSlots`,
                                  currentTimeSlots.filter((_, index) => index !== slotIndex)
                                );
                              }}
                            >
                              <Minus />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </>
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  });

  useEffect(() => {
    const fetchTrainerAvailabilitySlots = async () => {
      if (!id) return setIsLoading(false);
      try {
        const response = await axiosInstance.get(`/trainer/${id}/trainer-availability-slots`);
        const slots = response.data.data;

        const updatedDays = daysOfWeek.map((day, index) => {
          const daySlots = slots.filter((slot: ApiTimeSlot) => slot.weekday === index);
          return {
            isChecked: daySlots.length > 0,
            timeSlots: daySlots.map((slot: ApiTimeSlot) => ({
              startTime: dayjs(`2000-01-01T${slot.startTime}`).toDate(),
              endTime: dayjs(`2000-01-01T${slot.endTime}`).toDate(),
            })),
          };
        });

        setValue('days', updatedDays);
      } catch (error) {
        console.error('Error fetching trainer availability slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainerAvailabilitySlots();
  }, [id, setValue]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      trainerAvailabilitySlot: data.days
        .flatMap((day, index) =>
          day.isChecked
            ? day.timeSlots.map((slot) => ({
                weekday: index,
                startTime: slot.startTime ? dayjs(slot.startTime).format('HH:mm:ss') : null,
                endTime: slot.endTime ? dayjs(slot.endTime).format('HH:mm:ss') : null,
              }))
            : []
        )
        .filter((slot) => slot.startTime && slot.endTime),
    };

    try {
      await axiosInstance.put(`trainer/${id}/trainer-availability-slots`, payload);
      toast.success('Trainer Availability added successfully');
      router.push('/dashboard/trainers');
    } catch (error) {
      console.error('Error saving slots:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box>
          {timeSlotFields}
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Box>
      )}
    </form>
  );
}
