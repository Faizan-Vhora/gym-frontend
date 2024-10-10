import React from 'react';
import { BOOKING_PAYMENT_TYPE, BOOKING_TYPE, WEEKDAY_NAME, WEEKDAY_OPTIONS } from '@/utils/constant';
import { formatDate } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Barbell, CurrencyCircleDollar, Envelope, Phone } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z as zod } from 'zod';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { Option } from '@/components/core/option';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';
import BookingPreviewDialog from './booking-preview';
import PaymentToggle from './payment-toggle';
import { Sessions } from './types';

// Interfaces
export interface BookingFormDialogPropsI {
  onClose?: () => void;
  onCreate?: () => void;
  open?: boolean;
  range?: { start: Date; end: Date };
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

export type SelectedSlotsI = Record<string, SlotI[]>;

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

export function BookingFormDialog({
  onClose,
  onCreate,
  open = false,
  range,
}: BookingFormDialogPropsI): React.JSX.Element {
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

  const [bookingDate, setBookingDate] = React.useState(
    range?.start ? dayjs(range?.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [bookingStartDate, setBookingStartDate] = React.useState(
    range?.start ? dayjs(range?.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [bookingEndDate, setBookingEndDate] = React.useState(
    range?.end ? dayjs(range?.end).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [slotsWeekly, setSlotWeeklyData] = React.useState<WeeklySlotI[]>([]);
  const [availableWeekDayOptions, setAvailableWeekDayOptions] = React.useState<WeeklyDayOptionI[]>([]);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([dayjs().day()]); // Default to today's weekday
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlotsI>({});
  const [paymentType, setPaymentType] = React.useState<string>(BOOKING_PAYMENT_TYPE.FULL); // Initialize with an empty string
  const [bookingAmount, setBookingAmount] = React.useState<number>(0);
  const [bookingHours, setBookingHours] = React.useState<number>(0);
  const [netTotalAmount, setNetTotalAmount] = React.useState<number>(0);
  const [isPreviewOpen, setPreviewOpen] = React.useState(false);

  // Fetch data
  const fetchCustomers = async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get<{ data: Customer[] }>('/users/customer/dropdown');
      setCustomerOptions(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers.';
      toast.error(`Error fetching customers: ${errorMessage}`);
    }
  };

  const fetchTrainers = async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get<{ data: Trainer[] }>('/users/trainer/dropdown');
      setTrainerOptions(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trainers.';
      toast.error(`Error fetching trainers: ${errorMessage}`);
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

  const handleSessionSlotChange = (weekday: string | number, selectedSlotsForSession: SlotI[]) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [weekday]: selectedSlotsForSession,
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
          sessionDurationInHours: sessionDurationInHours,
          trainerRatePerHour: trainerRatePerHour,
          sessionCharge: sessionCharge,
          discount: 0, // Assuming no discount
          netTotalAmount: netTotalAmount,
        };

        // Add session to the list
        sessions.push(session);
      });
    });

    return sessions;
  };

  const calculateTotalBookingHours = (sessionsList: Sessions[]): number => {
    return sessionsList.reduce((totalHours, session) => {
      return totalHours + (session.sessionDurationInHours || 0);
    }, 0);
  };

  const calculateTotalSessionAmount = (sessionsList: Sessions[]): number => {
    return sessionsList.reduce((sessionCharge, session) => {
      return sessionCharge + (session.sessionCharge || 0);
    }, 0);
  };

  const calculateTotalBookingNetAmount = (sessionsList: Sessions[]): number => {
    return sessionsList.reduce((netTotal, session) => {
      return netTotal + (session.netTotalAmount || 0);
    }, 0);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const verifyBookingForm = (formValues: BookingFormInputs) => {
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
        // Check if selectedTrainer is defined
        if (!selectedTrainer) {
          return;
        }

        const trainerRatePerHour: number = Number(selectedTrainer.fees || 0);
        const weekdaysList = Object.keys(selectedSlots).join(',');

        // Ensure convertSelectedSlotsToSessions is defined
        if (typeof convertSelectedSlotsToSessions !== 'function') {
          return;
        }

        const sessionsList = convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);

        const bookingHours = calculateTotalBookingHours(sessionsList);

        const sessionsAmount = calculateTotalSessionAmount(sessionsList);

        const bookingNetAmount = calculateTotalBookingNetAmount(sessionsList);

        const payload = {
          booking: {
            trainer: formValues.trainerId,
            customer: formValues.customerId,
            bookingType,
            startDate: bookingStartDate,
            endDate: bookingEndDate,
            trainerRatePerHour: trainerRatePerHour,
            bookingHours: bookingHours,
            bookingAmount: sessionsAmount,
            weekdays: weekdaysList,
            recurrenceWeeks: 0,
            totalAmount: sessionsAmount,
            discount: 0,
            netTotalAmount: bookingNetAmount,
            paymentType: paymentType,
          },
          sessions: sessionsList,
        };

        // await axiosInstance.post('/session-booking', payload);
        // toast.success('Booking added successfully');

        // // Check if onCreate is defined before calling it
        // if (typeof onCreate === 'function') {
        //   onCreate();
        // } else {
        //   console.error('onCreate is not a function');
        // }
      } else {
      }
    },
    [bookingType, selectedSlots, selectedTrainer, onCreate]
  );

  // Fetch data on mount

  React.useEffect(() => {
    fetchTrainers();
    fetchCustomers();
  }, []);

  React.useEffect(() => {}, [selectedDays]);

  React.useEffect(() => {}, [paymentType]);

  React.useEffect(() => {
    const trainerRatePerHour: number = Number(selectedTrainer?.fees || 0);
    const sessionsList = convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);
    setBookingAmount(calculateTotalSessionAmount(sessionsList));
    setBookingHours(calculateTotalBookingHours(sessionsList));
    setNetTotalAmount(calculateTotalBookingNetAmount(sessionsList));
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
            {`${'Add Booking'}`}
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

              {selectedCustomer && (
                <Card
                  sx={{
                    height: '140px',
                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar src={selectedCustomer.profileImageUrl} sx={{ height: '56px', width: '56px' }}></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{selectedCustomer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedCustomer.email ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Envelope width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {selectedCustomer.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedCustomer.phoneNumber ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Phone width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {selectedCustomer.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}
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

              {selectedTrainer && (
                <Card
                  sx={{
                    height: '140px',
                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar src={selectedTrainer.profileImageUrl} sx={{ height: '56px', width: '56px' }}></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{selectedTrainer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedTrainer.fees ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <CurrencyCircleDollar width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {selectedTrainer.fees} per Hour
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedTrainer.experience ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Barbell width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {selectedTrainer.experience} years
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}
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
          <Button color="secondary" onClick={handlePreview}>
            Preview
          </Button>
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

      <BookingPreviewDialog
        isOpen={isPreviewOpen}
        handleClose={handlePreviewClose}
        selectedCustomer={selectedCustomer}
        selectedTrainer={selectedTrainer}
        selectedSlots={selectedSlots}
        bookingAmount={bookingAmount}
        bookingHours={bookingHours}
        netTotalAmount={netTotalAmount}
        bookingType={bookingType}
      />
    </Dialog>
  );
}
