'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Avatar, Card, CardContent, Grid, MenuItem, Select, Tab, Tabs, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers';
import { Barbell, CurrencyCircleDollar, Envelope, Phone } from '@phosphor-icons/react';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import { z as zod } from 'zod';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';
import BookingPreviewDialog from './booking-preview';
import calculateTotalHours from './calculate-hours';
import PaymentToggle from './payment-toggle';
import { AvailableSlots, BookingType, DateSlot, Sessions, Slot, WeekSlot, type Event } from './types';

export interface BookingCreate {
  trainer: number;
  customer: number;
  startDate: string;
  endDate: string;
  bookingType: string;
  trainerRatePerHour: number;
  bookingHours: number;
  bookingAmount: number;
  weekdays: string;
  recurrenceWeeks: number;
  totalAmount: number;
  discount: number;
  netTotalAmount: number;
  paymentType: string;
}

export interface BookingCreateParams {
  booking: BookingCreate;
  sessions: Sessions[];
}

export interface BookingUpdate {
  trainer?: number;
  customer?: number;
  startDate?: string;
  endDate?: string;
  bookingType?: string;
  trainerRatePerHour?: number;
  bookingHours?: number;
  bookingAmount?: number;
  weekdays?: string;
  recurrenceWeeks?: number;
  totalAmount?: number;
  discount?: number;
  netTotalAmount?: number;
  paymentType?: string;
}

export interface BookingUpdateParams {
  booking?: BookingUpdate;
  sessions?: Sessions[];
}

export const bookingTypeOptions: Record<BookingType, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
};

const SESSION_PAYMENT_TYPES = {
  PER_SESSION: 'per_session',
  FULL: 'full',
};

const schema = zod
  .object({
    trainer: zod.number().min(1, 'Trainer is required').max(255),
    customer: zod.number().min(1, 'Member is required').max(255),
    selectDate: zod.date(),
    start: zod.date(),
    end: zod.date(),
    bookingType: zod.string(),
    trainerRatePerHour: zod.number().nullable(),
  })
  .refine((data) => data.start < data.end, { message: 'End date should be greater than start date', path: ['end'] });

type Values = zod.infer<typeof schema>;

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  return `${formattedDate} (${dayOfWeek})`; // Example: September 27, 2024 (Friday)
};

function getDefaultValues({
  event,
  range,
}: {
  event?: Event;
  range?: { start: Date; end: Date; selectDate: Date };
}): Values {
  const defaultTrainer = typeof event?.trainer === 'number' ? event.trainer : 0; // Ensure trainer is a number
  const defaultCustomer = typeof event?.customer === 'number' ? event.customer : 0; // Ensure customer is a number
  const defaultTrainerRatePerHour = typeof event?.trainerRatePerHour === 'number' ? event.trainerRatePerHour : 0;
  const defaultSelectDate = event?.selectDate ?? range?.selectDate ?? new Date();
  const defaultStart = event?.startDate ?? range?.start ?? new Date();
  const defaultEnd = event?.endDate ?? range?.end ?? dayjs().add(30, 'minute').toDate();

  return {
    trainer: defaultTrainer,
    customer: defaultCustomer,
    trainerRatePerHour: defaultTrainerRatePerHour,
    bookingType: event?.bookingType ?? '',
    selectDate: defaultSelectDate,
    start: defaultStart,
    end: defaultEnd,
  };
}

export interface EventDialogProps {
  action: 'create' | 'update';
  event?: Event;
  onClose?: () => void;
  onCreate?: (params: BookingCreateParams) => void;
  onDelete?: (eventId: string) => void;
  onUpdate?: (eventId: string, params: BookingUpdateParams) => void;
  open?: boolean;
  range?: { start: Date; end: Date; selectDate: Date };
}

export function EventDialog({
  action = 'create',
  event,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  open = false,
  range,
}: EventDialogProps): React.JSX.Element {
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = React.useState<Trainer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [tab, setTab] = React.useState('one_time'); // State to control the active tab
  const [slotsOneTime, setSlotOneTimeData] = React.useState<AvailableSlots | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlots>({});
  const [slotsWeekly, setSlotWeeklyData] = React.useState<AvailableSlots | null>(null);
  const [startDateWeeklyOne, setStartDateWeeklyOne] = React.useState<Date | null>(null);
  const [isPreviewOpen, setPreviewOpen] = React.useState(false);
  const [paymentType, setPaymentType] = React.useState(SESSION_PAYMENT_TYPES.PER_SESSION);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  // const [filteredWeekSlots, setFilteredWeekSlots] = React.useState<WeekSlot[]>([]);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ defaultValues: getDefaultValues({ event, range }), resolver: zodResolver(schema) });

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface TrainerResponseData {
    data: Trainer[];
    errors?: ErrorDetail;
  }

  const fetchTrainers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<TrainerResponseData>('/users/trainer/dropdown');

      // Access and handle response data
      const responsedata = response.data.data;
      if (Array.isArray(responsedata)) {
        setTrainers(responsedata); // `items` is of type `Trainer[]`
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
        setError('Unexpected data format.');
      }
    } catch (err) {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching trainers: ${err.message}`;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies for memoization

  React.useEffect(() => {
    const loadTrainers = async (): Promise<void> => {
      try {
        await fetchTrainers();
      } catch (err: unknown) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching Trainers: ${err.message}`;
        }
        toast.error(errorMessage);
      }
    };

    // Immediately invoke the async function and handle the promise
    loadTrainers().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching Trainers: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, [fetchTrainers]);

  interface CustomerResponse {
    data: Customer[];
  }

  const fetchCustomers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<CustomerResponse>('/users/customer/dropdown', {});
      setCustomers(response.data.data);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch customers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []); // Include membershipFilter here

  React.useEffect(() => {
    // Define an async function and invoke it
    const loadCustomers = async (): Promise<void> => {
      try {
        await fetchCustomers();
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
      }
    };

    void loadCustomers();
  }, [fetchCustomers]);

  const getTotalHoursFromSelectedSlots = (selected: SelectedSlots): number => {
    // Transform the selected slots into AvailableSlots format
    const availableSlots: AvailableSlots = {
      data: Object.keys(selected).map((date) => ({
        date,
        slots: selected[date], // Use the selected slots for this date
      })),
    };

    // Calculate total hours using the provided function
    return calculateTotalHours(availableSlots);
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const convertSelectedSlotsToSessions = (
    selectedSlots: SelectedSlots,
    trainerRatePerHour: number,
    notes: string
  ): Sessions[] => {
    const sessions: Sessions[] = [];

    Object.keys(selectedSlots).forEach((date) => {
      const slots = selectedSlots[date];

      slots.forEach((slot) => {
        const sessionDurationInHours =
          (new Date(`1970-01-01T${slot.endTime}Z`).getTime() - new Date(`1970-01-01T${slot.startTime}Z`).getTime()) /
          (1000 * 60 * 60); // Calculate duration in hours

        const sessionCharge = sessionDurationInHours * trainerRatePerHour;
        const netTotalAmount = sessionCharge; // Assuming no discount

        // Create session object
        const session: Sessions = {
          sessionDate: dayjs(date).format('YYYY-MM-DD'),
          sessionStartTime: slot.startTime,
          sessionEndTime: slot.endTime,
          trainerRatePerHour,
          sessionCharge,
          discount: 0, // Assuming no discount
          netTotalAmount,
          notes,
        };

        // Add session to the list
        sessions.push(session);
      });
    });

    return sessions;
  };

  const clearSlotSelection = () => {
    // Reset to an empty object since null is not assignable
    setSelectedSlots({});
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
    clearSlotSelection(); // Clear the selected slots on tab change
  };

  const handleTrainerChange = (trainerId: number) => {
    const selected = trainers.find((trainer: Trainer) => trainer.id === trainerId); // Compare with number
    let startDate = tab === 'one_time' ? event?.selectDate : event?.startDate;
    let endDate = tab === 'one_time' ? event?.selectDate : event?.endDate;

    // Check if date is selected, if not, use today's date
    const startDateToUse = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    const endDateToUse = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

    if (selected) {
      setSelectedTrainer(selected);
      void fetchSlotsData(String(selected.id), startDateToUse, endDateToUse);
    }
  };

  const fetchSlotsData = async (trainerId: string, start: string, end: string): Promise<void> => {
    try {
      const response = await axiosInstance.get('/session-booking/trainer/available-session-slots', {
        params: {
          trainerId: trainerId,
          startDate: start,
          endDate: end,
        },
      });
      if (tab === 'one_time') {
        setSlotOneTimeData(response.data);
      }
      setSlotWeeklyData(response.data);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch slot Data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleSlotChange = (date: string, selectedSlotsForDate: Slot[]) => {
    setSelectedSlots((prev) => {
      // Create a new object to ensure immutability
      const updatedSlots = {
        ...prev,
        [date]: [...selectedSlotsForDate], // Update with the new array reference
      };

      return updatedSlots;
    });
  };

  // useEffect to watch for changes in selectedSlots
  React.useEffect(() => {
    // Log the updated selected slots here
    console.log('Updated selectedSlots:', selectedSlots);
  }, [selectedSlots]);

  type SelectedSlots = Record<string, Slot[]>;

  const handleCustomerChange = (customerId: number) => {
    const selected = customers.find((customer) => customer.id === customerId);
    setSelectedCustomer(selected || null);
  };

  const generateUpcomingDates = (selectedDays: number[]): Date[] => {
    const upcomingDates: Date[] = [];
    const today = new Date();

    selectedDays.forEach((day) => {
      let currentDay = new Date(today);
      let occurrences = 0;

      while (occurrences < 4) {
        if (currentDay.getDay() === day) {
          upcomingDates.push(new Date(currentDay));
          occurrences += 1;
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }
    });

    return upcomingDates;
  };

  // React.useEffect(() => {
  //   if (slotsWeekly?.success) {
  //     const upcomingDates = generateUpcomingDates(selectedDays);

  //     const newFilteredSlots: WeekSlot[] = upcomingDates
  //       .map((date) => {
  //         const day = date.getDay();
  //         console.log('Day', day);
  //         const weeklySlots = slotsWeekly.data.find((slot: DateSlot) => slot.weekday === day);
  //         return weeklySlots
  //           ? {
  //               date: date.toDateString(), // Format the date as needed
  //               slots: weeklySlots.weekSlots,
  //             }
  //           : null;
  //       })
  //       .filter((weekSlot): weekSlot is WeekSlot => weekSlot !== null); // Type guard to remove null values

  //     setFilteredWeekSlots(newFilteredSlots);
  //   }
  // }, [selectedDays, slotsWeekly]);

  const getWeekdaysFromDates = (startDate: Date, endDate: Date): string => {
    const start = moment(startDate);
    const end = moment(endDate);

    // If start and end dates are the same, return the day number directly
    if (start.isSame(end, 'day')) {
      return String(start.day()); // Return the day number directly (0 = Sunday, 6 = Saturday)
    }

    const weekDayList: number[] = [];

    // Loop through the date range day by day
    for (let current = start.clone(); current.isSameOrBefore(end); current.add(1, 'day')) {
      const dayOfWeek = current.day(); // Get the numeric day of the week (0-6)

      // Add the dayOfWeek to the list if it's not already in it
      if (!weekDayList.includes(dayOfWeek)) {
        weekDayList.push(dayOfWeek);
      }
    }
    console.log('Weekday list ', weekDayList);
    return weekDayList.join(',');
  };

  const totalHours = getTotalHoursFromSelectedSlots(selectedSlots);

  const fees = selectedTrainer?.fees || 0; // Default to 0 if fees is undefined

  const bookingAmount = fees * totalHours;
  const Notes = 'No refunds for cancellation';

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      console.log('Entered on submit');
      try {
        const weekdays = getWeekdaysFromDates(
          tab === 'weekly' ? values.start : values.selectDate,
          tab === 'weekly' ? values.end : values.selectDate
        );

        const sessions = convertSelectedSlotsToSessions(selectedSlots, Number(fees), Notes);
        if (paymentType) {
          const params = {
            booking: {
              trainer: values.trainer,
              customer: values.customer,
              bookingType: tab,
              endDate:
                tab === 'weekly'
                  ? dayjs(values.end).format('YYYY-MM-DD')
                  : dayjs(values.selectDate).format('YYYY-MM-DD'),
              startDate:
                tab === 'weekly'
                  ? dayjs(values.start).format('YYYY-MM-DD')
                  : dayjs(values.selectDate).format('YYYY-MM-DD'),

              trainerRatePerHour: Number(fees),
              bookingHours: totalHours,
              bookingAmount: bookingAmount,
              weekdays: weekdays,
              recurrenceWeeks: 0,
              totalAmount: bookingAmount,
              discount: 0,
              netTotalAmount: bookingAmount,
              paymentType: paymentType,
            },
            sessions: sessions,
          } satisfies BookingCreateParams | BookingUpdateParams;

          await axiosInstance.post('/session-booking', params);
          toast.success('Booking added successfully');
        }
      } catch (err) {
        logger.error(err);
        // toast.error('Something went wrong!');
      }
    },
    [action, event, onCreate, onUpdate, selectedSlots, paymentType]
  );

  React.useEffect(() => {
    // Reset form when dialog data changes
    reset(getDefaultValues({ event, range }));
  }, [event, range, reset]);

  return (
    <>
      <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: 3 }}>
            <Typography sx={{ textAlign: 'center' }} variant="h5">
              {event ? 'Edit Booking' : 'Add Booking'}
            </Typography>
          </Box>
          <Stack spacing={2} sx={{ p: 3 }}>
            <Grid container sx={{ justifyContent: 'space-between' }} spacing={3}>
              <Grid item md={5.8}>
                <Controller
                  control={control}
                  name="customer"
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.customer)}>
                      <InputLabel>Member</InputLabel>
                      <Select
                        {...field}
                        label="Customer"
                        onChange={(e) => {
                          const customerId = Number(e.target.value);
                          field.onChange(e);
                          handleCustomerChange(customerId);
                        }}
                      >
                        <Option value="">
                          <em>Select a Member</em>
                        </Option>
                        {customers.map((customer) => (
                          <Option key={customer.id} value={customer.id}>
                            {customer.fullName}
                          </Option>
                        ))}
                      </Select>
                      {errors.customer && <FormHelperText>{errors.customer.message}</FormHelperText>}
                    </FormControl>
                  )}
                />

                {selectedCustomer && (
                  <Card
                    sx={{
                      boxShadow: 5, // Normal box shadow
                      '&:hover': {
                        boxShadow: 15, // Increased box shadow on hover
                      },
                      transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    }}
                  >
                    <CardContent>
                      <Grid container>
                        <Grid item md={4} alignContent={'center'}>
                          <Avatar
                            src={selectedCustomer.profileImageUrl}
                            sx={{ height: '56px', width: '56px' }}
                          ></Avatar>
                        </Grid>
                        <Grid item md={8} alignContent={'center'}>
                          <Typography variant="subtitle1">{selectedCustomer.fullName}</Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            {selectedCustomer.email ? (
                              <IconButton>
                                <Envelope />
                              </IconButton>
                            ) : (
                              ''
                            )}
                            {selectedCustomer.email}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            {selectedCustomer.phoneNumber ? (
                              <IconButton>
                                <Phone />
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
              <Grid item md={5.8}>
                <Controller
                  control={control}
                  name="trainer"
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.trainer)}>
                      <InputLabel>Trainer</InputLabel>
                      <Select
                        {...field}
                        label="Trainer"
                        onChange={(e) => {
                          const trainerId = Number(e.target.value);
                          field.onChange(e);
                          handleTrainerChange(trainerId);
                        }}
                      >
                        <Option value="">
                          <em>Select a Trainer</em>
                        </Option>
                        {trainers.map((trainer) => (
                          <Option key={trainer.id} value={trainer.id}>
                            {trainer.fullName}
                          </Option>
                        ))}
                      </Select>
                      {errors.trainer && <FormHelperText>{errors.trainer.message}</FormHelperText>}
                    </FormControl>
                  )}
                />

                {selectedTrainer && (
                  <Card
                    sx={{
                      boxShadow: 5, // Normal box shadow
                      '&:hover': {
                        boxShadow: 15, // Increased box shadow on hover
                      },
                      transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
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
                              <IconButton>
                                <CurrencyCircleDollar />
                              </IconButton>
                            ) : (
                              ''
                            )}
                            {selectedTrainer.fees} per Hour
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            {selectedTrainer.experience ? (
                              <IconButton>
                                <Barbell />
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
              <Divider />
              <Grid item md={12}>
                <Stack sx={{ margin: '20px', alignItems: 'center' }}>
                  <Divider />
                  <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label="One Time Session" value="one_time" />
                    <Tab label="Weekly" value="weekly" />
                  </Tabs>
                </Stack>
              </Grid>
              {tab === 'one_time' && (
                <>
                  <Grid item md={6}>
                    <Controller
                      control={control}
                      name="selectDate"
                      render={({ field }) => (
                        <DatePicker
                          disablePast
                          disabled={!selectedTrainer}
                          format="MM-DD-YYYY"
                          label="Select date"
                          onChange={(date) => {
                            const selectedDate = date ? date.toDate() : null;
                            field.onChange(selectedDate);

                            // Call the API if selected is present
                            if (selectedTrainer && selectedDate) {
                              const startDateOneTime = selectedDate
                                ? dayjs(selectedDate).format('YYYY-MM-DD')
                                : dayjs().format('YYYY-MM-DD');
                              void fetchSlotsData(String(selectedTrainer.id), startDateOneTime, startDateOneTime);
                            }
                          }}
                          slotProps={{
                            textField: {
                              error: Boolean(errors.selectDate),
                              helperText: errors.selectDate?.message,
                            },
                          }}
                          value={dayjs(field.value)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={12}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                      Available Time Slots
                    </Typography>
                    {slotsOneTime && slotsOneTime.success && slotsOneTime.data.length > 0 ? (
                      slotsOneTime.data.map((dateSlot: DateSlot, dateIndex: number) => (
                        <div key={dateIndex}>
                          {dateSlot.weekSlots.map((weekSlot: WeekSlot, weekIndex: number) => (
                            <div key={weekIndex}>
                              <Typography variant="subtitle1" sx={{ margin: '20px', textAlign: 'center' }}>
                                {weekSlot.date}
                              </Typography>
                              <Autocomplete
                                multiple
                                options={weekSlot.slots}
                                disableCloseOnSelect
                                getOptionLabel={(option: Slot) => `${option.startTime} - ${option.endTime}`}
                                getOptionDisabled={(option: Slot) => !option.isAvailable}
                                value={selectedSlots[weekSlot.date] || []}
                                onChange={(event, newValue) => handleSlotChange(weekSlot.date, newValue)}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props} style={{ opacity: option.isAvailable ? 1 : 0.5 }}>
                                    <Checkbox checked={selected} disabled={!option.isAvailable} />
                                    {`${option.startTime} - ${option.endTime}`}
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
                              />
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <Typography>No available slots</Typography>
                    )}
                  </Grid>
                </>
              )}
              {tab === 'weekly' && (
                <>
                  <Grid item md={6}>
                    <Controller
                      control={control}
                      name="start"
                      render={({ field }) => (
                        <DatePicker
                          disablePast
                          disabled={!selectedTrainer}
                          format="MM-DD-YYYY"
                          label="Start date"
                          onChange={(date) => {
                            const startDateweeklyone = date ? date.toDate() : null;
                            field.onChange(startDateweeklyone);
                            setStartDateWeeklyOne(startDateweeklyone);
                            if (selectedTrainer && startDateweeklyone) {
                              const startDateweekly = startDateweeklyone
                                ? dayjs(startDateweeklyone).format('YYYY-MM-DD')
                                : dayjs().format('YYYY-MM-DD');
                              const endDateweekly = event?.endDate
                                ? dayjs(event?.endDate).format('YYYY-MM-DD')
                                : dayjs().format('YYYY-MM-DD');
                              void fetchSlotsData(String(selectedTrainer.id), startDateweekly, endDateweekly);
                            }
                          }}
                          slotProps={{ textField: { error: Boolean(errors.start), helperText: errors.start?.message } }}
                          value={dayjs(field.value)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Controller
                      control={control}
                      name="end"
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
                              const startDateweekly = startDateWeeklyOne
                                ? dayjs(startDateWeeklyOne).format('YYYY-MM-DD')
                                : dayjs().format('YYYY-MM-DD');
                              const endDateweekly = selectedDate
                                ? dayjs(selectedDate).format('YYYY-MM-DD')
                                : dayjs().format('YYYY-MM-DD');
                              void fetchSlotsData(String(selectedTrainer.id), startDateweekly, endDateweekly);
                            }
                          }}
                          value={dayjs(field.value)}
                          slotProps={{
                            textField: {
                              error: Boolean(errors.end),
                              helperText: errors.end?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={12}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                      Available Time Slots for{' '}
                      {selectedDays.length > 0
                        ? selectedDays.map((day) => daysOfWeek[day].label).join(', ')
                        : 'Selected Days'}
                    </Typography>

                    <FormControl sx={{ minWidth: 200, margin: '20px auto', display: 'block' }}>
                      <Autocomplete
                        multiple
                        options={daysOfWeek}
                        getOptionLabel={(option) => option.label}
                        value={daysOfWeek.filter((day) => selectedDays.includes(day.value))}
                        onChange={(event, newValue) => {
                          const selectedValues = newValue.map((day) => day.value);
                          setSelectedDays(selectedValues);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Days" variant="outlined" placeholder="Choose days" />
                        )}
                      />
                    </FormControl>

                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                      Available Time Slots
                    </Typography>
                    {slotsWeekly && slotsWeekly.success && slotsWeekly.data.length > 0 ? (
                      slotsWeekly.data.map((dateSlot: DateSlot, dateIndex: number) => (
                        <div key={dateIndex}>
                          {dateSlot.weekSlots.map((weekSlot: WeekSlot, weekIndex: number) => (
                            <div key={weekIndex}>
                              <Typography variant="subtitle1" sx={{ margin: '20px', textAlign: 'center' }}>
                                {weekSlot.date}
                              </Typography>
                              <Autocomplete
                                multiple
                                options={weekSlot.slots}
                                disableCloseOnSelect
                                getOptionLabel={(option: Slot) => `${option.startTime} - ${option.endTime}`}
                                getOptionDisabled={(option: Slot) => !option.isAvailable}
                                value={selectedSlots[weekSlot.date] || []}
                                onChange={(event, newValue) => handleSlotChange(weekSlot.date, newValue)}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props} style={{ opacity: option.isAvailable ? 1 : 0.5 }}>
                                    <Checkbox checked={selected} disabled={!option.isAvailable} />
                                    {`${option.startTime} - ${option.endTime}`}
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
                              />
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <Typography>No available slots</Typography>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </Stack>
          <Divider />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <PaymentToggle bookingAmount={bookingAmount} setPaymentType={setPaymentType} />
            {action === 'update' ? (
              <IconButton
                color="error"
                onClick={() => {
                  onDelete?.(event!.id);
                }}
              >
                <TrashIcon />
              </IconButton>
            ) : (
              <div />
            )}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="secondary" onClick={onClose}>
                Cancel
              </Button>
              <div>
                <Button onClick={handlePreview}>Open Booking Preview</Button>

                {/* Render the dialog */}
                <BookingPreviewDialog
                  isOpen={isPreviewOpen}
                  handleClose={handlePreviewClose}
                  selectedCustomer={selectedCustomer}
                  selectedTrainer={selectedTrainer}
                  selectedSlots={selectedSlots}
                  formatDate={formatDate}
                  getTotalHours={totalHours}
                  bookingAmount={bookingAmount}
                />
              </div>
              <Button type="submit" variant="contained">
                Confirm
              </Button>
            </Stack>
          </Stack>
        </form>
        {loading && <CustomLoader />}
        <ToastContainer />
      </Dialog>
    </>
  );
}
