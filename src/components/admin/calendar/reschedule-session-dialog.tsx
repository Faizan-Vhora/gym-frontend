import React, { useEffect, useState } from 'react';
import { DateFormat } from '@/utils/constant';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
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
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import { BookingSessionEntry } from '../booking/view/booking-sessions/booking-session-table';
import { DateSlot, ScheduleResponse, Slot, WeekSlot } from './types';

interface SlotRescheduleFormProps {
  sessionObj: BookingSessionEntry;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { sessionStartTime: string; sessionEndTime: string; sessionDate: string }) => void;
}

export interface SlotI {
  date?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  isDateLabel?: boolean;
  discount?: boolean;
}

interface TrainerBlockDatesResponse {
  data: string[];
}

interface TrainerAvailableWeekDaysResponse {
  data: number[];
}

const SlotRescheduleForm: React.FC<SlotRescheduleFormProps> = ({ sessionObj, open, onClose, onSubmit }) => {
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
  const [trainerBlockDatesList, setTrainerBlockDatesList] = React.useState<string[]>([]);
  const [tarinerAvailableWeekDays, setTarinerAvailableWeekDays] = React.useState<number[]>([]);
  const [scheduleResponse, setScheduleResponse] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedDate = watch('selectedDate');

  useEffect(() => {
    if (sessionObj) {
      const slotSartTime = new Date(`${sessionObj.sessionDate} ${sessionObj.sessionStartTime}`);
      const slotEndTime = new Date(`${sessionObj.sessionDate} ${sessionObj.sessionEndTime}`);

      setValue('selectedDate', dayjs(sessionObj.sessionDate));
      setValue('selectedSlot', {
        startTime: dayjs(slotSartTime).format('HH:mm:ss'),
        endTime: dayjs(slotEndTime).format('HH:mm:ss'),
        isAvailable: true,
      });
    }
  }, [sessionObj, setValue]);

  const fetchSlotsData = async (trainerId: number | null | undefined, date: Dayjs) => {
    setLoading(true);
    const start = date.startOf('day').format(DateFormat.dateFormat);
    const end = date.endOf('day').format(DateFormat.dateFormat);
    try {
      const response = await axiosInstance.get<ScheduleResponse>('/session-booking/trainer/available-session-slots', {
        params: { trainerId, startDate: start, endDate: end },
      });
      setScheduleResponse(response.data);
    } catch (error) {
      toast.error(
        `Failed to fetch slot data: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerBlockDatesData = async (trainerId: number | undefined): Promise<void> => {
    try {
      const response = await axiosInstance.get<TrainerBlockDatesResponse>('/session-booking/trainer/block-dates', {
        params: { trainerId },
      });
      const trainerBlockDates = response.data.data;
      setTrainerBlockDatesList(trainerBlockDates || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch block dates data: ${errorMessage}`);
    }
  };

  const fetchTrainerAvailableWeekdaysData = async (trainerId: number | undefined): Promise<void> => {
    try {
      const response = await axiosInstance.get<TrainerAvailableWeekDaysResponse>(
        '/session-booking/trainer/available-weekdays',
        {
          params: { trainerId },
        }
      );
      const trainerAvailableWeekDays = response.data.data;
      setTarinerAvailableWeekDays(trainerAvailableWeekDays || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch block dates data: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (sessionObj && selectedDate) {
        void fetchTrainerBlockDatesData(sessionObj.trainer?.id);
        void fetchTrainerAvailableWeekdaysData(sessionObj.trainer?.id);
        return fetchSlotsData(sessionObj.trainer?.id, selectedDate);
      }
    };

    fetchData()
      .then(() => {
        // Process successful fetch if needed
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast.error(errorMessage); // Display toast error message
      });
  }, [sessionObj, selectedDate]);

  const isPastDatetime = (slotOption: SlotI): boolean => {
    // Combine date and time strings to create full datetime strings
    // console.log("slotOption:: ", slotOption)
    const startDatetime = moment(`${slotOption.date} ${slotOption.startTime}`, 'YYYY-MM-DD HH:mm:ss');
    // const endDatetime = moment(`${slotOption.date} ${slotOption.endTime}`, 'YYYY-MM-DD HH:mm:ss');
    // Get the current date and time
    const now = moment();
    return startDatetime.isSameOrBefore(now);
  };

  const onSubmitForm = (data: { selectedDate: Dayjs | null; selectedSlot: Slot | null }) => {
    if (data.selectedSlot && data.selectedDate) {
      onSubmit({
        sessionStartTime: data.selectedSlot.startTime,
        sessionEndTime: data.selectedSlot.endTime,
        sessionDate: data.selectedDate.format('YYYY-MM-DD'),
      }); // No await here if onSubmit is synchronous
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Session</DialogTitle>
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
                    onChange={(newValue: Dayjs | null) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(fieldState.error),
                        helperText: fieldState.error?.message,
                      },
                    }}
                    shouldDisableDate={(date) => {
                      const dayOfWeek = dayjs(date).day(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                      const isUnavailableWeekday = !tarinerAvailableWeekDays.includes(dayOfWeek); // Check if the day is not in tarinerAvailableWeekDays
                      return (
                        trainerBlockDatesList.includes(dayjs(date).format('YYYY-MM-DD')) || // Existing check for blocked dates
                        isUnavailableWeekday // New check for unavailable weekdays
                      );
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
                        {formatDate(weekSlot.date)}
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
                            getOptionDisabled={(option) => !option.isAvailable || isPastDatetime(option)}
                            getOptionLabel={(option: Slot) => `${option.startTime} - ${option.endTime}`}
                            isOptionEqualToValue={(option, value) =>
                              option.startTime === value.startTime && option.endTime === value.endTime
                            }
                            onChange={(_, newValue) => {
                              field.onChange(newValue);
                            }}
                            renderOption={(props, option, { selected }) => (
                              <li {...props} style={{ opacity: option.isAvailable ? 1 : 0.5 }}>
                                <Checkbox checked={selected} disabled={!option.isAvailable || isPastDatetime(option)} />
                                {`${formatTo12HourFormat(option.startTime)} - ${formatTo12HourFormat(option.endTime)}`}
                                {!option.isAvailable}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Time Slot"
                                variant="outlined"
                                placeholder="Choose a slot"
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                              />
                            )}
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
        <Button
          onClick={onClose}
          sx={{
            border: '1px solid',
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
        <Button
          className="common-button"
          onClick={handleSubmit(onSubmitForm)}
          color="primary"
          disabled={Boolean(errors.selectedDate) || Boolean(errors.selectedDate) || loading}
        >
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotRescheduleForm;
