import React from 'react';
import {
  BOOKING_PAYMENT_TYPE,
  BOOKING_TYPE,
  WEEKDAY_NAME,
  WEEKDAY_OPTIONS,
} from '@/utils/constant';
import { formatDate } from '@/utils/dateUtils';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z as zod } from 'zod';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { Option } from '@/components/core/option';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';
import PaymentToggle from './payment-toggle';
import { Sessions } from './types';
import BookingPreviewDialog from './booking-preview';

// Interfaces
export interface BookingFormDialogPropsI {
  onClose?: () => void;
  onCreate?: () => void;
  open?: boolean;
}

export interface SlotI {
  date?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  isDateLabel?: boolean;
}

export interface weekSlotI {
  date: string;
  slots: Array<SlotI>;
}

export interface WeeklySlotI {
  weekday: number;
  weekSlots: Array<weekSlotI>;
}

export interface WeeklyDayOptionI {
  value: number;
  label: string;
  isAvailable?: boolean;
}

type SelectedSlotsI = Record<string, SlotI[]>;

// Define Booking form validation schemas
const bookingSchema = zod.object({
  trainerId: zod.number().optional(),
  customerId: zod.number().optional(),
  bookingDate: zod.date().optional(),
  bookingStartDate: zod.date().optional(),
  bookingEndDate: zod.date().optional(),
  bookingType: zod.string().optional(),
  paymentType: zod.string().optional(),
});

type BookingFormInputs = zod.infer<typeof bookingSchema>;

export function BookingFormDialog({ onClose, onCreate, open = false }: BookingFormDialogPropsI): React.JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInputs>({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur',
  });

  // State variables
  const [loading, setLoading] = React.useState(false);
  const [selectedTrainer, setSelectedTrainer] = React.useState<Trainer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [customerOptions, setCustomerOptions] = React.useState<Customer[]>([]);
  const [trainerOptions, setTrainerOptions] = React.useState<Trainer[]>([]);
  const [bookingType, setBookingType] = React.useState(BOOKING_TYPE.ONE_TIME);

  const [bookingDate, setBookingDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [bookingStartDate, setBookingStartDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [bookingEndDate, setBookingEndDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [slotsWeekly, setSlotWeeklyData] = React.useState<WeeklySlotI[]>([]);
  const [availableWeekDayOptions, setAvailableWeekDayOptions] = React.useState<WeeklyDayOptionI[]>([]);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([dayjs().day()]); // Default to today's weekday
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlotsI>({});
  const [paymentType, setPaymentType] = React.useState<string>(BOOKING_PAYMENT_TYPE.FULL); // Initialize with an empty string
  const [bookingAmount, setBookingAmount] = React.useState<number>(0);

  // Fetch data
  const fetchCustomers = async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get<{ data: Customer[] }>('/users/customer/dropdown');
      setCustomerOptions(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers.';
      toast.error(`Error fetching customers: ${errorMessage}`);
      console.error(errorMessage);
    }
  };

  const fetchTrainers = async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get<{ data: Trainer[] }>('/users/trainer/dropdown');
      setTrainerOptions(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trainers.';
      toast.error(`Error fetching trainers: ${errorMessage}`);
      console.error(errorMessage);
    }
  };

  const fetchTrainerSlotsData = async (trainerId: string, startDate: string, endDate: string): Promise<void> => {
    setSelectedSlots({});
    setSelectedDays([]);

    setLoading(true); // Set loading true when fetching data
    try {
      const { data } = await axiosInstance.get('/session-booking/trainer/available-session-slots', {
        params: { trainerId, startDate: startDate, endDate: endDate },
      });

      const availableTrainerSlots = data.data;

      if (bookingType === BOOKING_TYPE.ONE_TIME && availableTrainerSlots[0]?.weekday) {
        setSelectedDays([availableTrainerSlots[0].weekday]);
      } else {
        setSelectedDays([]);
      }

      setSlotWeeklyData(availableTrainerSlots || []);
      const trainerWeekDays: number[] = availableTrainerSlots.map((ele: any) => ele.weekday);
      WEEKDAY_OPTIONS.forEach((ele: any) => {
        ele.isAvailable = trainerWeekDays.includes(ele.value);
      });

      setAvailableWeekDayOptions(WEEKDAY_OPTIONS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch slot data: ${errorMessage}`);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleCustomerChange = (customerId: number) => {
    const selected = customerOptions.find((customer) => customer.id === customerId);
    setSelectedCustomer(selected || null);
  };

  const handleTrainerChange = (trainerId: number) => {
    const selected = trainerOptions.find((trainer) => trainer.id === trainerId);
    setSelectedTrainer(selected || null);
  };

  const handleTabChange = (newValue: string) => {
    setBookingType(newValue);
  };

  const handleSessionSlotChange = (date: string | number, selectedSlotsForDate: SlotI[]) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [date]: selectedSlotsForDate,
    }));
  };


  const transformSlots = (input: weekSlotI[]): SlotI[] => {
    return input.flatMap((item) => [
      { date: formatDate(item.date), isDateLabel: true },
      ...item.slots.map((slot) => ({
        date: slot.date,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
      })),
    ]);
  };

  const convertSelectedSlotsToSessions = (selectedSlots: SelectedSlotsI, trainerRatePerHour: number): Sessions[] => {
    const sessions: Sessions[] = [];

    Object.keys(selectedSlots).forEach((weekday) => {
      const slots = selectedSlots[weekday];

      slots.forEach((slot) => {
        const sessionDurationInHours =
          (new Date(`1970-01-01T${slot.endTime}Z`).getTime() - new Date(`1970-01-01T${slot.startTime}Z`).getTime()) /
          (1000 * 60 * 60); // Calculate duration in hours

        const sessionCharge = sessionDurationInHours * trainerRatePerHour;
        const netTotalAmount = sessionCharge; // Assuming no discount

        // Create session object
        const session: Sessions = {
          sessionDate: dayjs(slot.date).format('YYYY-MM-DD'),
          sessionStartTime: slot.startTime,
          sessionEndTime: slot.endTime,
          trainerRatePerHour,
          sessionCharge,
          discount: 0, // Assuming no discount
          netTotalAmount,
        };

        // Add session to the list
        sessions.push(session);
      });
    });

    return sessions;
  };

  const verifyBookingForm = (formValues: BookingFormInputs) => {
    console.log('formValues: ', formValues);

    if (!formValues.customerId) {
      toast.error('Please select a member.');
      return false;
    } else if (!formValues.trainerId) {
      toast.error('Please select a trainer.');
      return false;
    } else if (!formValues.bookingType) {
      toast.error('Please select a booking type.');
      return false;
    } else if (!bookingStartDate || !bookingEndDate) {
      toast.error('Please select booking dates');
      return false;
    } else if (!selectedDays.length) {
      toast.error('Please select a weekday.');
      return false;
    } else if (Object.keys(selectedSlots).length === 0) {
      toast.error('Please select at least one slot.');
      return false;
    } else if (!paymentType) {
      toast.error('Please select a Payment Type.');
      return false;
    }

    return true;
  };

  const onSubmit = React.useCallback(
    async (formValues: BookingFormInputs): Promise<void> => {
      formValues.bookingType = bookingType;
      const isValid = verifyBookingForm(formValues);

      if (isValid) {
        console.log('Form submitted successfully:', formValues);

        // Check if selectedTrainer is defined
        if (!selectedTrainer) {
          console.error('Selected trainer is undefined');
          return;
        }

        const trainerRatePerHour: number = Number(selectedTrainer.fees || 0);
        const weekdaysList = Object.keys(selectedSlots).join(',');

        // Ensure convertSelectedSlotsToSessions is defined
        if (typeof convertSelectedSlotsToSessions !== 'function') {
          console.error('convertSelectedSlotsToSessions is not a function');
          return;
        }

        const sessionsList = convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);

        const payload = {
          booking: {
            trainer: formValues.trainerId,
            customer: formValues.customerId,
            bookingType,
            startDate: bookingStartDate,
            endDate: bookingEndDate,
            trainerRatePerHour: trainerRatePerHour,
            bookingHours: sessionsList.length,
            bookingAmount: sessionsList.reduce((total, session) => total + session.sessionCharge, 0),
            weekdays: weekdaysList,
            recurrenceWeeks: 0,
            totalAmount: sessionsList.reduce((total, session) => total + session.sessionCharge, 0),
            discount: 0,
            netTotalAmount: sessionsList.reduce((total, session) => total + session.sessionCharge, 0),
            paymentType: paymentType,
          },
          sessions: sessionsList,
        };

        console.log('Payload: ', payload);

        await axiosInstance.post('/session-booking', payload);
        toast.success('Booking added successfully');

        // Check if onCreate is defined before calling it
        if (typeof onCreate === 'function') {
          onCreate();
        } else {
          console.error('onCreate is not a function');
        }
      } else {
        console.log('Form not valid.');
      }
    },
    [bookingType, selectedSlots, selectedTrainer, onCreate]
  );

  // Fetch data on mount

  React.useEffect(() => {
    fetchTrainers();
    fetchCustomers();
  }, []);

  React.useEffect(() => {
    console.log('Update : selectedDays:: ', selectedDays);
  }, [selectedDays]);

  React.useEffect(() => {
    console.log('Update : paymentType:: ', paymentType);
  }, [paymentType]);

  React.useEffect(() => {
    console.log('Update : paymentType:: ', paymentType);
    const trainerRatePerHour: number = Number(selectedTrainer?.fees || 0);
    const sessionsList = convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);
    const bookingAmount = sessionsList.reduce((total, session) => total + session.sessionCharge, 0);
    setBookingAmount(bookingAmount);
  }, [selectedSlots, selectedTrainer]);

  React.useEffect(() => {
    if (bookingType == BOOKING_TYPE.ONE_TIME && selectedTrainer && bookingDate) {
      fetchTrainerSlotsData(selectedTrainer.id.toString(), bookingDate, bookingDate);
    }

    if (bookingType == BOOKING_TYPE.WEEKLY && selectedTrainer && bookingStartDate && bookingEndDate) {
      fetchTrainerSlotsData(selectedTrainer.id.toString(), bookingStartDate, bookingEndDate);
    }
  }, [selectedTrainer, bookingType, bookingDate, bookingStartDate, bookingEndDate]);

  // Render the dialog
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: 3 }}>
          <Typography sx={{ textAlign: 'center' }} variant="h5">
            {'Add Booking - V2'}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5.8}>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customerId)}>
                    <InputLabel>Member</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const customerId = Number(e.target.value);
                        field.onChange(customerId);
                        handleCustomerChange(customerId);
                      }}
                      label="Customer"
                    >
                      <Option value="">
                        <em>Select a Member</em>
                      </Option>
                      {customerOptions.map((customer) => (
                        <Option key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </Option>
                      ))}
                    </Select>
                    {errors.customerId && <FormHelperText>{errors.customerId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={5.8}>
              <Controller
                control={control}
                name="trainerId"
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.trainerId)}>
                    <InputLabel>Trainer</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const trainerId = Number(e.target.value);
                        field.onChange(trainerId);
                        handleTrainerChange(trainerId);
                      }}
                      label="Trainer"
                    >
                      <Option value="">
                        <em>Select a Trainer</em>
                      </Option>
                      {trainerOptions.map((trainer) => (
                        <Option key={trainer.id} value={trainer.id}>
                          {trainer.fullName}
                        </Option>
                      ))}
                    </Select>
                    {errors.trainerId && <FormHelperText>{errors.trainerId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack sx={{ margin: '20px', alignItems: 'center', width: '100%' }}>
                <Divider />
                <Tabs value={bookingType} onChange={(e, newValue) => handleTabChange(newValue)} sx={{ width: '100%' }}>
                  <Tab label="One Time Session" value={BOOKING_TYPE.ONE_TIME} />
                  <Tab label="Weekly" value={BOOKING_TYPE.WEEKLY} />
                </Tabs>
              </Stack>
            </Grid>

            {bookingType === BOOKING_TYPE.ONE_TIME && (
              <>
                <Grid item xs={12} md={5.8}>
                  <Controller
                    control={control}
                    name="bookingDate"
                    render={({ field }) => (
                      <DatePicker
                        sx={{ width: '100%' }}
                        disablePast
                        disabled={!selectedTrainer}
                        format="MM-DD-YYYY"
                        label="Select date"
                        onChange={(date) => {
                          const bookingDate = date ? date.toDate() : null;
                          field.onChange(bookingDate);

                          if (selectedTrainer && bookingDate) {
                            const startDateOneTime = dayjs(bookingDate).format('YYYY-MM-DD');
                            setBookingDate(startDateOneTime);
                          }
                        }}
                        slotProps={{
                          textField: {
                            error: Boolean(errors.bookingDate),
                            helperText: errors.bookingDate?.message,
                          },
                        }}
                        value={field.value ? dayjs(field.value) : dayjs()} // Set today's date as default if no value
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {bookingType === BOOKING_TYPE.WEEKLY && (
              <>
                <Grid item md={6}>
                  <Controller
                    control={control}
                    name="bookingStartDate"
                    render={({ field }) => (
                      <DatePicker
                        disablePast
                        disabled={!selectedTrainer}
                        format="MM-DD-YYYY"
                        label="Start date"
                        onChange={(date) => {
                          const startDateWeeklyOne = date ? date.toDate() : null;
                          field.onChange(startDateWeeklyOne);

                          if (selectedTrainer && startDateWeeklyOne) {
                            const startDateFormatted = dayjs(startDateWeeklyOne).format('YYYY-MM-DD');
                            setBookingStartDate(startDateFormatted);
                          }
                        }}
                        slotProps={{
                          textField: {
                            error: Boolean(errors.bookingStartDate),
                            helperText: errors.bookingStartDate?.message,
                          },
                        }}
                        value={field.value ? dayjs(field.value) : dayjs()} // Default to today
                      />
                    )}
                  />
                </Grid>

                <Grid item md={6}>
                  <Controller
                    control={control}
                    name="bookingEndDate"
                    render={({ field }) => (
                      <DatePicker
                        disablePast
                        disabled={!selectedTrainer}
                        format="MM-DD-YYYY"
                        label="End date"
                        onChange={(date) => {
                          const selectedDate = date ? date.toDate() : null;
                          field.onChange(selectedDate);

                          if (selectedTrainer && selectedDate) {
                            const endDateFormatted = dayjs(selectedDate).format('YYYY-MM-DD');
                            setBookingEndDate(endDateFormatted);
                          }
                        }}
                        slotProps={{
                          textField: {
                            error: Boolean(errors.bookingEndDate),
                            helperText: errors.bookingEndDate?.message,
                          },
                        }}
                        value={field.value ? dayjs(field.value) : dayjs()} // Default to today
                      />
                    )}
                  />
                </Grid>

                <Grid item md={12}>
                  <FormControl sx={{ minWidth: 200, display: 'block' }}>
                    <Autocomplete
                      multiple
                      options={availableWeekDayOptions}
                      getOptionLabel={(option) => option.label}
                      value={availableWeekDayOptions.filter((day) => selectedDays.includes(day.value))}
                      onChange={(event, newValue) => {
                        const selectedValues = newValue.map((day) => day.value);
                        setSelectedDays(selectedValues);
                      }}
                      getOptionDisabled={(option) => !option.isAvailable} // Disable options based on isAvailable
                      renderInput={(params) => (
                        <TextField {...params} label="Select Days" variant="outlined" placeholder="Choose days" />
                      )}
                    />
                  </FormControl>
                </Grid>
              </>
            )}


            <Grid item md={8} sx={{ paddingTop: '0px' }}>
              {slotsWeekly.length > 0 ? (
                slotsWeekly
                  .filter((ele) => selectedDays.includes(ele.weekday))
                  .map((weekDaySlot: WeeklySlotI, dateIndex: number) => (
                    <div key={dateIndex}>
                      <Typography variant="subtitle1">{WEEKDAY_NAME[weekDaySlot.weekday]}</Typography>
                      <Autocomplete
                        multiple
                        options={transformSlots(weekDaySlot.weekSlots)}
                        disableCloseOnSelect
                        getOptionLabel={(option) =>
                          option.isDateLabel ? `${option.date}` : `${option.startTime} - ${option.endTime}`
                        }
                        getOptionDisabled={(option) => !option.isAvailable}
                        value={selectedSlots[weekDaySlot.weekday] || []}
                        onChange={(event, newValue) => handleSessionSlotChange(weekDaySlot.weekday, newValue)}
                        renderOption={(props, option, { selected }) => (
                          <li
                            {...props}
                            style={{ opacity: option.isAvailable ? 1 : 0.5 }}
                            key={`${option.date}-${option.startTime}`}
                          >
                            {option.isDateLabel ? (
                              `${option.date}`
                            ) : (
                              <>
                                <Checkbox checked={selected} disabled={!option.isAvailable} />
                                {`${option.startTime} - ${option.endTime}`}
                              </>
                            )}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Time Slots"
                            variant="outlined"
                            placeholder="Choose slots"
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.date === value.date &&
                          option.startTime === value.startTime &&
                          option.endTime === value.endTime
                        }
                      />
                    </div>
                  ))
              ) : (
                <Typography>No available slots</Typography>
              )}
            </Grid>


          </Grid>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <PaymentToggle bookingAmount={bookingAmount} setPaymentType={setPaymentType} />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end', p: 2 }}>

          <Button color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Confirm
          </Button>
        </Stack>
      </form>

      {loading && <CustomLoader />}
      <ToastContainer />
    </Dialog>
  );
}
