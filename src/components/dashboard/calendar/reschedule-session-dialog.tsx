import React, { useEffect, useState } from 'react';
import { DateFormat } from '@/utils/constant';
import { convertTo12HourFormat } from '@/utils/dateUtils';
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import { DateSlot, ScheduleResponse, Slot, WeekSlot } from './types';

interface Event {
  id: string;
  start: string;
  end: string;
  title: string;
}

interface SlotRescheduleFormProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { sessionStartTime: string; sessionEndTime: string; sessionDate: string }) => void;
  trainerId: number | null;
}

const SlotRescheduleForm: React.FC<SlotRescheduleFormProps> = ({ event, open, onClose, onSubmit, trainerId }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<{
    selectedDate: Dayjs | null;
    selectedSlot: Slot | null;
  }>();

  const [scheduleResponse, setScheduleResponse] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedDate = watch('selectedDate');

  useEffect(() => {
    if (event) {
      setValue('selectedDate', dayjs(event.start));
      setValue('selectedSlot', {
        startTime: dayjs(event.start).format('HH:mm'),
        endTime: dayjs(event.end).format('HH:mm'),
        isAvailable: true,
      });
    }
  }, [event, setValue]);

  const fetchSlotsData = async (trainerId: number, date: Dayjs) => {
    setLoading(true);
    const start = date.startOf('day').format(DateFormat.dateFormat);
    const end = date.endOf('day').format(DateFormat.dateFormat);
    try {
      const response = await axiosInstance.get<ScheduleResponse>('/session-booking/trainer/available-session-slots', {
        params: { trainerId, startDate: start, endDate: end },
      });
      setScheduleResponse(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error(
        `Failed to fetch slot data: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trainerId && selectedDate) {
      fetchSlotsData(trainerId, selectedDate);
    }
  }, [trainerId, selectedDate]);

  const onSubmitForm = (data: { selectedDate: Dayjs | null; selectedSlot: Slot | null }) => {
    if (data.selectedSlot && data.selectedDate) {
      onSubmit({
        sessionStartTime: data.selectedSlot.startTime,
        sessionEndTime: data.selectedSlot.endTime,
        sessionDate: data.selectedDate.format('YYYY-MM-DD'),
      });
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Session: {event.title}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl fullWidth margin="normal">
              <Controller
                name="selectedDate"
                control={control}
                defaultValue={null}
                rules={{ required: 'Please select a date' }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    disablePast
                    label="Select New Date"
                    value={field.value}
                    onChange={(newValue: Dayjs | null) => field.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </LocalizationProvider>

          {loading ? (
            <CircularProgress />
          ) : scheduleResponse && scheduleResponse.success && scheduleResponse.data.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ textAlign: 'start', mt: 2 }}>
                Available Time Slots
              </Typography>
              {scheduleResponse.data.map((dateSlot: DateSlot, dateIndex: number) => (
                <div key={dateIndex}>
                  {dateSlot.weekSlots.map((weekSlot: WeekSlot, weekIndex: number) => (
                    <div key={weekIndex}>
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'start' }}>
                        {weekSlot.date}
                      </Typography>
                      <Controller
                        name="selectedSlot"
                        control={control}
                        defaultValue={null}
                        rules={{ required: 'Please select a time slot' }}
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            {...field}
                            options={weekSlot.slots}
                            getOptionLabel={(option: Slot) => `${option.startTime} - ${option.endTime}`}
                            isOptionEqualToValue={(option, value) =>
                              option.startTime === value.startTime && option.endTime === value.endTime
                            }
                            onChange={(_, newValue) => field.onChange(newValue)}
                            renderOption={(props, option, { selected }) => (
                              <li {...props} style={{ opacity: option.isAvailable ? 1 : 0.5 }}>
                                <Checkbox checked={selected} disabled={!option.isAvailable} />
                                {`${convertTo12HourFormat(option.startTime)} - ${convertTo12HourFormat(option.endTime)}`}
                                {!option.isAvailable && ' (Unavailable)'}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Time Slot"
                                variant="outlined"
                                placeholder="Choose a slot"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                              />
                            )}
                            getOptionDisabled={(option) => !option.isAvailable}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <Typography sx={{ mt: 2 }}>No available slots for the selected date</Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmitForm)}
          color="primary"
          disabled={!!errors.selectedDate || !!errors.selectedSlot || loading}
        >
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotRescheduleForm;
