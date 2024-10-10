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

import { WEEKDAY, WEEKDAY_NAME } from '@/utils/constant';
import { formatDate } from '@/utils/dateUtils';
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
import { BookingType, DateSlot, Sessions, Slot, WeekSlot, type Event } from './types';

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
    trainerRatePerHour: zod.number().nullable(),
    bookingType : zod.string(),
  })
  .refine((data) => data.start < data.end, { message: 'End date should be greater than start date', path: ['end'] });

type Values = zod.infer<typeof schema>;


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

export interface BookingFormDialogProps {
  action: 'create' | 'update';
  event?: Event;
  onClose?: () => void;
  onCreate?: (params: BookingCreateParams) => void;
  onDelete?: (eventId: string) => void;
  onUpdate?: (eventId: string, params: BookingUpdateParams) => void;
  open?: boolean;
  range?: { start: Date; end: Date; selectDate: Date };
}

export interface SlotI {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface WeeklySlot {
  weekday: number;
  weekSlots: Array<{
    date: string;
    slots: Array<SlotI>;
  }>;
}

export interface AvailableSlots {}

export function BookingFormDialog({
  action = 'create',
  event,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  open = false,
  range,
}: BookingFormDialogProps): React.JSX.Element {
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = React.useState<Trainer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [bookingType, setBookingType] = React.useState('one_time'); // State to control the active tab
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlots>({});
  const [slotsWeekly, setSlotWeeklyData] = React.useState<WeeklySlot[] | null>(null);
  const [startDateWeeklyOne, setStartDateWeeklyOne] = React.useState<Date | null>(null);
  const [isPreviewOpen, setPreviewOpen] = React.useState(false);
  const [paymentType, setPaymentType] = React.useState(SESSION_PAYMENT_TYPES.PER_SESSION);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [availableWeekDayOptions, setAvailableWeekDayOptions] = React.useState<any[]>([]);

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
      setTrainers(responsedata); // `items` is of type `Trainer[]`

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


  const weekDaysOptions = [
    { value: WEEKDAY.SUNDAY, label: WEEKDAY_NAME[WEEKDAY.SUNDAY], isAvailable: false },
    { value: WEEKDAY.MONDAY, label: WEEKDAY_NAME[WEEKDAY.MONDAY], isAvailable: false },
    { value: WEEKDAY.TUESDAY, label: WEEKDAY_NAME[WEEKDAY.TUESDAY], isAvailable: false },
    { value: WEEKDAY.WEDNESDAY, label: WEEKDAY_NAME[WEEKDAY.WEDNESDAY], isAvailable: false },
    { value: WEEKDAY.THURSDAY, label: WEEKDAY_NAME[WEEKDAY.THURSDAY], isAvailable: false },
    { value: WEEKDAY.FRIDAY, label: WEEKDAY_NAME[WEEKDAY.FRIDAY], isAvailable: false },
    { value: WEEKDAY.SATURDAY, label: WEEKDAY_NAME[WEEKDAY.SATURDAY], isAvailable: false },
  ];

  const convertSelectedSlotsToSessions = (
    selectedSlots: SelectedSlots,
    trainerRatePerHour: number,
    notes: string
  ): Sessions[] => {
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
    setBookingType(newValue);
    clearSlotSelection(); // Clear the selected slots on tab change
  };

  const handleTrainerChange = (trainerId: number) => {
    const selected = trainers.find((trainer: Trainer) => trainer.id === trainerId); // Compare with number
    let startDate = bookingType === 'one_time' ? event?.selectDate : event?.startDate;
    let endDate = bookingType === 'one_time' ? event?.selectDate : event?.endDate;

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
      console.log('response : ', response);

      console.log('response.data.data : ', response.data.data);

      if (bookingType === 'one_time') {
        if(response.data.data[0].weekday){
          setSelectedDays( [response.data.data[0].weekday]);
        }
      }

      setSlotWeeklyData(response.data.data);

      console.log('slotsWeekly: ', response.data.data || []);

      const trainerWeekDays: any = [];
      response.data.data.forEach((ele: any) => {
        trainerWeekDays.push(ele.weekday);
      });

      console.log('trainerWeekDays: ', trainerWeekDays);

      weekDaysOptions.forEach((ele: any) => {
        ele.isAvailable = trainerWeekDays.includes(ele.value);

        console.log('ele.value:: ', ele.value);
        console.log('trainerWeekDays.includes(ele.value):: ', trainerWeekDays.includes(ele.value));
      });

      console.log('weekDaysOptions: ', weekDaysOptions);

      setAvailableWeekDayOptions(weekDaysOptions);
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


  const handleSessionSlotChange = (date: string | number, selectedSlotsForDate: Slot[]) => {
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

  React.useEffect(() => {
    // Log the updated selected slots here
    console.log('Updated selectedSlots:', selectedSlots);
  }, [selectedSlots]);

  type SelectedSlots = Record<string, Slot[]>;

  const handleCustomerChange = (customerId: number) => {
    const selected = customers.find((customer) => customer.id === customerId);
    setSelectedCustomer(selected || null);
  };



  const totalHours = getTotalHoursFromSelectedSlots(selectedSlots);

  const fees = selectedTrainer?.fees || 0; // Default to 0 if fees is undefined

  const bookingAmount = fees * totalHours;
  const Notes = 'No refunds for cancellation';


  const resetForm = ()=>{

    setSelectedDays([]);
    setSelectedSlots({});

  }

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      console.log('Entered on submit');

      console.log(" ==============  SUBMIT ================= ")
      console.log("values: ", values)


      try {

        console.log("selectedSlots: ", selectedSlots)


        const weekdays = Object.keys(selectedSlots).join(',');

        console.log("weekdays: ", weekdays)


        const sessionsList = convertSelectedSlotsToSessions(selectedSlots, Number(fees), Notes);

        console.log("sessionsList: ", sessionsList)

        if (paymentType) {
          const payload = {
            booking: {
              trainer: values.trainer,
              customer: values.customer,
              bookingType: bookingType,
              endDate:
              bookingType === 'weekly'
                  ? dayjs(values.end).format('YYYY-MM-DD')
                  : dayjs(values.selectDate).format('YYYY-MM-DD'),
              startDate:
              bookingType === 'weekly'
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
            sessions: sessionsList,
          } satisfies BookingCreateParams | BookingUpdateParams;


          console.log(" payload: ", payload)

          await axiosInstance.post('/session-booking', payload);
          toast.success('Booking added successfully');

          resetForm();
          onClose;

        }
      } catch (err) {
        logger.error(err);
        // toast.error('Something went wrong!');
      }

      console.log(" ==============  SUBMIT ================= ")
    },
    [action, event, onCreate, onUpdate, selectedSlots, paymentType]
  );

  React.useEffect(() => {
    // Reset form when dialog data changes
    reset(getDefaultValues({ event, range }));
  }, [event, range, reset]);

  interface Slot {
    date?: string;
    weekday?: number;
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
    isDateLabel?: boolean;
  }

  interface InputDate {
    date: string;
    slots: Slot[];
  }

  interface OutputSlot {
    date: string;
    weekday?: number;
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
    isDateLabel?: boolean;
  }

  const transformSlots = (input: WeekSlot[]): OutputSlot[] => {
    const output: OutputSlot[] = [];

    for (const item of input) {
      // Add the date object with isDateLabel false
      output.push({
        date: formatDate(item.date),
        isDateLabel: true,
      });

      // Add the slots for this date
      for (const slot of item.slots) {
        output.push({
          date: slot.date,
          weekday: slot.weekday,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        });
      }
    }

    return output;
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: 3 }}>
            <Typography sx={{ textAlign: 'center' }} variant="h5">
              {event ? 'Edit Booking' : 'Add Booking - V2'}
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
                          <Avatar
                            src={selectedCustomer.profileImageUrl}
                            sx={{ height: '56px', width: '56px' }}
                          ></Avatar>
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
              <Divider />

              <Grid item md={12}>
                <Stack sx={{ margin: '20px', alignItems: 'center' }}>
                  <Divider />
                  <Tabs value={bookingType} onChange={handleTabChange}>
                    <Tab label="One Time Session" value="one_time" />
                    <Tab label="Weekly" value="weekly" />
                  </Tabs>
                </Stack>
              </Grid>

              {bookingType === 'one_time' && (
                <>
                  <Grid item md={8}>
                    <Controller
                      control={control}
                      name="selectDate"
                      render={({ field }) => (
                        <DatePicker
                          sx={{ width: '100%' }}
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


                    <Grid item md={8} sx={{ paddingTop: '0px' }}>

                    {slotsWeekly && slotsWeekly.length > 0 ? (
                      slotsWeekly
                        .filter((ele) => selectedDays.includes(ele.weekday))
                        .map((weekDaySlot: DateSlot, dateIndex: number) => (
                          <div key={dateIndex}>
                            <Typography variant="subtitle1"> {WEEKDAY_NAME[weekDaySlot.weekday]} </Typography>
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
                            />
                          </div>
                        ))
                    ) : (
                      <Typography>No available slots</Typography>
                    )}
                  </Grid>

                </>
              )}

              {bookingType === 'weekly' && (
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
                  <Grid item md={8} sx={{ paddingTop: '0px' }}>

                    {slotsWeekly && slotsWeekly.length > 0 ? (
                      slotsWeekly
                        .filter((ele) => selectedDays.includes(ele.weekday))
                        .map((weekDaySlot: DateSlot, dateIndex: number) => (
                          <div key={dateIndex}>
                            <Typography variant="subtitle1"> {WEEKDAY_NAME[weekDaySlot.weekday]} </Typography>
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
                            />
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
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button color="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <div>
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
            <Button onClick={handlePreview}>Open Booking Preview</Button>
          </Stack>
        </form>
        {loading && <CustomLoader />}
        <ToastContainer />
      </Dialog>
    </>
  );
}
