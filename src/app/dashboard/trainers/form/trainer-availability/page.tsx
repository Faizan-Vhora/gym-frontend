'use client';

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
import Swal from 'sweetalert2';
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
  setSameTimeForAll: z.boolean(),
});

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
  setSameTimeForAll: boolean;
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

  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: daysOfWeek.map(() => ({
        isChecked: false,
        timeSlots: [],
      })),
      setSameTimeForAll: false,
    },
  });

  const { fields } = useFieldArray({ control, name: 'days' });

  useEffect(() => {
    const fetchTrainerAvailabilitySlots = async () => {
      if (!id) {
        setIsLoading(false);
        return; // Just use return without a value
      }
      try {
        // Specify the expected structure of the response using generics
        const response = await axiosInstance.get<{ data: ApiTimeSlot[] }>(`/trainer/${id}/trainer-availability-slots`);

        // Type the `slots` correctly to avoid `any` issue
        const slots: ApiTimeSlot[] = response.data.data;

        // Map through days of the week and filter slots based on the weekday
        const updatedDays: Day[] = daysOfWeek.map((_, index) => {
          const daySlots = slots.filter((slot) => slot.weekday === index);
          return {
            isChecked: daySlots.length > 0,
            timeSlots: daySlots.map((slot) => ({
              startTime: dayjs(`2000-01-01T${slot.startTime}`).toDate(),
              endTime: dayjs(`2000-01-01T${slot.endTime}`).toDate(),
            })),
          };
        });

        // Set the value for `days` with proper typing
        setValue('days', updatedDays);
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
        setIsLoading(false);
      }
    };

    void fetchTrainerAvailabilitySlots();
  }, [id, setValue]);

  const applySameTimeToAll = () => {
    const currentDays = watch('days');
    const firstCheckedDayIndex = currentDays.findIndex((day) => day.isChecked);

    if (firstCheckedDayIndex === -1) {
      toast.error('No day is selected. Please select at least one day.');
      return;
    }

    const firstDayTimeSlots = currentDays[firstCheckedDayIndex].timeSlots;

    const updatedDays = currentDays.map((day) => ({
      ...day,
      timeSlots: day.isChecked ? [...firstDayTimeSlots] : [],
    }));

    setValue('days', updatedDays);
  };

  const handleSameTimeForAllChange = async (checked: boolean) => {
    if (checked) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will apply the time slots from the first checked day to all other checked days and remove slots from unchecked days.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, apply it!',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        setValue('setSameTimeForAll', true);
        applySameTimeToAll();
        toast.success('Time slots have been applied to all checked days.');
      } else {
        setValue('setSameTimeForAll', false);
      }
    } else {
      setValue('setSameTimeForAll', false);
    }
  };

  const hasOverlappingTimeSlots = (timeSlots: ApiTimeSlot[], newSlot: ApiTimeSlot): boolean => {
    for (const slot of timeSlots) {
      if (slot === newSlot) continue;

      const slotStart = dayjs(`2000-01-01T${slot.startTime}`);
      const slotEnd = dayjs(`2000-01-01T${slot.endTime}`);
      const newSlotStart = dayjs(`2000-01-01T${newSlot.startTime}`);
      const newSlotEnd = dayjs(`2000-01-01T${newSlot.endTime}`);

      if (
        (slotStart.isBefore(newSlotEnd) && newSlotStart.isBefore(slotEnd)) ||
        (newSlotStart.isBefore(slotEnd) && slotStart.isBefore(newSlotEnd))
      ) {
        return true;
      }
    }
    return false;
  };

  const onSubmit = async (data: FormData) => {
    let trainerAvailabilitySlot: ApiTimeSlot[] = [];
    const checkedDays = data.days.filter((day) => day.isChecked);

    if (checkedDays.length === 0) {
      toast.error('Please select at least one day.');
      return;
    }

    const formatTimeToHHMMSS = (date: Date | null): string => {
      if (!date) return '';
      return dayjs(date).format('HH:mm:ss');
    };

    if (data.setSameTimeForAll) {
      const firstCheckedDay = checkedDays[0];
      if (!firstCheckedDay.timeSlots.length) {
        toast.error('Please add at least one time slot to the first checked day.');
        return;
      }

      trainerAvailabilitySlot = data.days.flatMap((day, index) =>
        day.isChecked
          ? firstCheckedDay.timeSlots.map((slot) => ({
              weekday: index,
              startTime: formatTimeToHHMMSS(slot.startTime),
              endTime: formatTimeToHHMMSS(slot.endTime),
            }))
          : []
      );
    } else {
      trainerAvailabilitySlot = data.days.flatMap((day, index) =>
        day.isChecked
          ? day.timeSlots.map((slot) => ({
              weekday: index,
              startTime: formatTimeToHHMMSS(slot.startTime),
              endTime: formatTimeToHHMMSS(slot.endTime),
            }))
          : []
      );
    }

    // Filter out invalid slots
    trainerAvailabilitySlot = trainerAvailabilitySlot.filter((slot) => slot.startTime && slot.endTime);

    if (trainerAvailabilitySlot.length === 0) {
      toast.error('Please add at least one valid time slot.');
      return;
    }

    // Check for overlapping slots
    const overlappingDays = new Set<string>();
    trainerAvailabilitySlot.forEach((slot) => {
      const daySlots = trainerAvailabilitySlot.filter((s) => s.weekday === slot.weekday);
      if (hasOverlappingTimeSlots(daySlots, slot)) {
        overlappingDays.add(daysOfWeek[slot.weekday].label);
      }
    });

    if (overlappingDays.size > 0) {
      toast.error(
        `Overlapping time slots detected for: ${Array.from(overlappingDays).join(', ')}. Please adjust them.`
      );
      return;
    }

    try {
      if (!id) throw new Error('Trainer ID is missing');

      await axiosInstance.put(`/trainer/${id}/trainer-availability-slots`, { trainerAvailabilitySlot });
      toast.success('Time slots saved successfully!');
      router.push('/dashboard/trainers');
    } catch (error) {
      toast.error('An error occurred while saving the time slots.');
    }
  };

  const timeSlotFields = fields.map((day, dayIndex) => {
    const isChecked = watch(`days.${dayIndex}.isChecked`);
    const setSameTimeForAll = watch('setSameTimeForAll');
    const isDisabled = setSameTimeForAll && dayIndex !== 0;

    return (
      <Box key={day.id} sx={{ marginBottom: 2 }}>
        <Grid container sx={{ padding: '5px' }} alignItems="center">
          <Grid item md={2}>
            <FormControlLabel
              control={
                <Controller
                  name={`days.${dayIndex}.isChecked`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        if (setSameTimeForAll) {
                          applySameTimeToAll();
                        }
                      }}
                    />
                  )}
                />
              }
              label={daysOfWeek[dayIndex].label}
            />
          </Grid>

          {isChecked && (
            <>
              <Grid item md={1}>
                <IconButton
                  onClick={() => {
                    if (setSameTimeForAll && dayIndex !== 0) return;
                    const currentTimeSlots = watch(`days.${dayIndex}.timeSlots`);
                    const newTimeSlot = { startTime: null, endTime: null };
                    setValue(`days.${dayIndex}.timeSlots`, [...currentTimeSlots, newTimeSlot]);
                    if (setSameTimeForAll) {
                      applySameTimeToAll();
                    }
                  }}
                  disabled={isDisabled}
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
                        <Grid container key={slotIndex} alignItems="center">
                          <Grid item xs={12} sm={6} md={4} sx={{ padding: '10px 10px' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <FormControl fullWidth>
                                <TimePicker
                                  label="Start Time"
                                  value={slot.startTime ? dayjs(slot.startTime) : null}
                                  onChange={(newValue) => {
                                    const updatedTimeSlots = [...field.value];
                                    updatedTimeSlots[slotIndex].startTime = newValue?.toDate() ?? null;
                                    setValue(`days.${dayIndex}.timeSlots`, updatedTimeSlots);
                                    if (setSameTimeForAll) {
                                      applySameTimeToAll();
                                    }
                                  }}
                                  disabled={isDisabled}
                                />
                              </FormControl>
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={12} sm={6} md={4} sx={{ padding: '10px 10px' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <FormControl fullWidth>
                                <TimePicker
                                  label="End Time"
                                  value={slot.endTime ? dayjs(slot.endTime) : null}
                                  onChange={(newValue) => {
                                    const updatedTimeSlots = [...field.value];
                                    updatedTimeSlots[slotIndex].endTime = newValue?.toDate() ?? null;
                                    setValue(`days.${dayIndex}.timeSlots`, updatedTimeSlots);
                                    if (setSameTimeForAll) {
                                      applySameTimeToAll();
                                    }
                                  }}
                                  disabled={isDisabled}
                                />
                              </FormControl>
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={12} sm={6} md={1}>
                            <IconButton
                              onClick={() => {
                                if (setSameTimeForAll && dayIndex !== 0) return;
                                const currentTimeSlots = [...field.value];
                                currentTimeSlots.splice(slotIndex, 1);
                                setValue(`days.${dayIndex}.timeSlots`, currentTimeSlots);
                                if (setSameTimeForAll) {
                                  applySameTimeToAll();
                                }
                              }}
                              disabled={isDisabled}
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Manage Weekly Time Slots
      </Typography>
      <FormControlLabel
        control={
          <Controller
            name="setSameTimeForAll"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                checked={field.value}
                onChange={(e) => handleSameTimeForAllChange(e.target.checked)}
              />
            )}
          />
        }
        label="Set Same Time for All Days"
      />

      {timeSlotFields}
      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
    </Box>
  );
}
