import React from 'react';
import { BOOKING_PAYMENT_TYPE, BOOKING_TYPE, WEEKDAY_NAME, WEEKDAY_OPTIONS, WeekDayOptionsI } from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import { calculateWeeksBetweenDates, formatDate } from '@/utils/date-utils';
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
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Select,
  Stack,
  Switch,
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

import { DiscountEntry, DiscountType } from '../discount/discount-table';
import BookingPreviewDialog from './booking-preview';
import PaymentToggle from './payment-toggle';
import { Customer, Sessions, Trainer } from './types';

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
  discount?: boolean;
}

export interface WeekSlotI {
  date: string;
  slots: SlotI[];
}

export interface WeeklySlotI {
  weekday: number;
  weekSlots: WeekSlotI[];
}

export interface WeeklyDayOptionI {
  value: number;
  label: string;
  isAvailable?: boolean;
}

interface TrainerTimeslotResponse {
  data: WeeklySlotI[];
}

export type SelectedSlotsI = Record<string, SlotI[]>;

export interface BookingDetailsI {
  bookingType?: string;
  selectedTrainer?: Trainer | null;
  selectedCustomer?: Customer | null;
  bookingDate?: string;
  bookingStartDate?: string;
  bookingEndDate?: string;
  selectedDays?: number[];
  selectedSlots?: SelectedSlotsI;
  paymentType?: string;
  bookingAmount?: number;
  selectedPromocode: DiscountEntry | null;
  bookingHours?: number;
  trainerRatePerHour?: number;
  discountAmount?: number;
  netTotalAmount?: number;
}

// Define Booking form validation schemas
const bookingSchema = zod.object({
  trainerId: zod.number().optional(),
  customerId: zod.number().optional(),
  bookingDate: zod.date().optional(),
  bookingStartDate: zod.date().optional(),
  bookingEndDate: zod.date().optional(),
  bookingType: zod.string().optional(),
  paymentType: zod.string().optional(),
  promocodeId: zod.number().nullable(),
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
  const [availableSlotsWeekly, setAvailableSlotWeeklyData] = React.useState<WeeklySlotI[]>([]);
  const [availableSlotsWeeklyByFilter, setAvailableSlotWeeklyByFilterData] = React.useState<WeeklySlotI[]>([]);
  const [availableWeekDayOptions, setAvailableWeekDayOptions] = React.useState<WeeklyDayOptionI[]>([]);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([dayjs().day()]); // Default to today's weekday
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlotsI>({});
  const [selectedBookingSlots, setSelectedBookingSlots] = React.useState<Sessions[]>([]);
  const [paymentType, setPaymentType] = React.useState<string>(BOOKING_PAYMENT_TYPE.FULL); // Initialize with an empty string
  const [bookingAmount, setBookingAmount] = React.useState<number>(0);
  const [bookingHours, setBookingHours] = React.useState<number>(0);
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);
  const [netTotalAmount, setNetTotalAmount] = React.useState<number>(0);
  const [bookingDetails, setBookingDetails] = React.useState<BookingDetailsI | null>(null);
  const [isPreviewOpen, setPreviewOpen] = React.useState(false);
  const [promocodeOptions, setPromocodeOptions] = React.useState<DiscountEntry[]>([]);
  const [selectedPromocode, setSelectedPromocode] = React.useState<DiscountEntry | null>(null);

  const [reOccuranceEnabled, setReOccuranceEnabled] = React.useState<boolean>(false);
  const [reOccuranceWeeks, setReOccuranceWeeks] = React.useState<number>(1);
  const [maxReOccuranceWeeks, setMaxReOccuranceWeeks] = React.useState<number>(1);

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

    setMaxReOccuranceWeeks(1);
    setReOccuranceWeeks(1);

    setLoading(true); // Set loading true when fetching data
    try {
      const response = await axiosInstance.get<TrainerTimeslotResponse>(
        '/session-booking/trainer/available-session-slots',
        {
          params: { trainerId, startDate: startDate, endDate: endDate },
        }
      );

      const availableTrainerSlots = response.data.data;
      // console.log("::availableTrainerSlots:", availableTrainerSlots)

      if (bookingType === BOOKING_TYPE.ONE_TIME && availableTrainerSlots[0]?.weekday) {
        setSelectedDays([availableTrainerSlots[0].weekday]);
      } else {
        setSelectedDays([]);
        const noOfWeeks: number = calculateWeeksBetweenDates(startDate, endDate);
        setMaxReOccuranceWeeks(noOfWeeks > 1 ? noOfWeeks - 1 : 1);
      }

      setAvailableSlotWeeklyData(availableTrainerSlots || []);
      const trainerWeekDays: number[] = availableTrainerSlots.map((ele: WeeklySlotI) => ele.weekday);
      WEEKDAY_OPTIONS.forEach((ele: WeekDayOptionsI) => {
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

  const getDataSkippingIndices = (dataArray: WeekSlotI[], skip: number): WeekSlotI[] => {
    const result: WeekSlotI[] = [];

    // Loop through the array and push elements starting from index 0, skipping the specified number of indices
    for (let i = 0; i < dataArray.length; i += skip + 1) {
      result.push(dataArray[i]);
    }

    return result;
  };

  const filterAvailableTrainerSlotsByReoccurrence = (): void => {
    // Create a deep copy of the available slots
    // const availableSlotsFilter: WeeklySlotI[] = JSON.parse(JSON.stringify(availableSlotsWeekly));
    const availableSlotsFilter: WeeklySlotI[] = JSON.parse(JSON.stringify(availableSlotsWeekly)) as WeeklySlotI[];

    // Only process the slots if booking type is weekly and reoccurrence is enabled
    if (bookingType === BOOKING_TYPE.WEEKLY && reOccuranceEnabled) {
      availableSlotsFilter.forEach((ele: WeeklySlotI) => {
        // Update weekSlots with the filtered results based on the skipping index
        ele.weekSlots = getDataSkippingIndices(ele.weekSlots, reOccuranceWeeks);
      });
    }
    setAvailableSlotWeeklyByFilterData(availableSlotsFilter);
  };

  const fetchPromocode = async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get<{ data: DiscountEntry[] }>('/discount/dropdown');
      setPromocodeOptions(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers.';
      toast.error(`Error fetching customers: ${errorMessage}`);
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

  const increaseReoccurrence = () => {
    setReOccuranceWeeks((prev: number) => (prev < maxReOccuranceWeeks ? prev + 1 : prev));
  };

  const decreaseReoccurrence = () => {
    setReOccuranceWeeks((prev: number) => (prev > 1 ? prev - 1 : 1));
  };

  const handlePromocodeChange = (promocodeId: number | null) => {
    const selected = promocodeOptions.find((promocode) => promocode.id === promocodeId);
    setSelectedPromocode(selected || null);
  };

  const handleSessionSlotChange = (weekday: string | number, selectedSlotsForSession: SlotI[]) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [weekday]: selectedSlotsForSession,
    }));
  };

  const transformSlots = (input: WeekSlotI[]): SlotI[] => {
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

  const convertSelectedSlotsToSessions = (
    selectedSlotsForSession: SelectedSlotsI,
    trainerRatePerHour: number
  ): Sessions[] => {
    let sessions: Sessions[] = [];
    Object.keys(selectedSlotsForSession).forEach((weekday) => {
      const slots = selectedSlotsForSession[weekday];

      slots.forEach((slot) => {
        const sessionDurationInHours =
          (new Date(`1970-01-01T${slot.endTime}Z`).getTime() - new Date(`1970-01-01T${slot.startTime}Z`).getTime()) /
          (1000 * 60 * 60); // Calculate duration in hours

        const sessionCharge = sessionDurationInHours * trainerRatePerHour;
        const netTotalAmountForSession = sessionCharge; // Assuming no discount

        // Create session object
        const session: Sessions = {
          sessionDate: dayjs(slot.date).format('YYYY-MM-DD'),
          sessionStartTime: slot.startTime,
          sessionEndTime: slot.endTime,
          sessionDurationInHours: sessionDurationInHours,
          trainerRatePerHour: trainerRatePerHour,
          sessionCharge: sessionCharge,
          discount: 0, // Assuming no discount
          netTotalAmount: netTotalAmountForSession,
        };

        // Add session to the list
        sessions.push(session);
      });
    });
    sessions = calculateTotalBookingNetAmountAndUpdateSessions(sessions);
    return sessions;
  };

  const calculateTotalBookingNetAmountAndUpdateSessions = (sessionsList: Sessions[]): Sessions[] => {
    //
    const totalHours = sessionsList.reduce((totalHours, session) => {
      return totalHours + (session.sessionDurationInHours || 0);
    }, 0);
    setBookingHours(totalHours);

    //
    const calculatedbookingAmount = sessionsList.reduce((sessionCharge, session) => {
      return sessionCharge + (session.sessionCharge || 0);
    }, 0);
    setBookingAmount(calculatedbookingAmount);

    //

    let totalDiscount = 0;

    let perHourDiscount = 0;

    if (selectedPromocode) {
      if (selectedPromocode.discountType === DiscountType.Fix) {
        totalDiscount = Number(selectedPromocode.discountValue || 0);
      } else if (selectedPromocode.discountType === DiscountType.Percentage) {
        totalDiscount = calculatedbookingAmount * (Number(selectedPromocode.discountValue || 0) / 100);
      }
    }

    perHourDiscount = totalHours ? parseFloat((totalDiscount / totalHours).toFixed(2)) : 0;

    sessionsList.forEach((ele) => {
      ele.discount = (ele?.sessionDurationInHours || 0) * perHourDiscount;
      ele.netTotalAmount = ele.sessionCharge - ele.discount;
    });
    //

    setDiscountAmount(totalDiscount);

    //
    const totalNetAmount = sessionsList.reduce((netTotal, session) => {
      return netTotal + (session.netTotalAmount || 0);
    }, 0);

    setNetTotalAmount(totalNetAmount);
    return sessionsList;

    //
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const verifyBookingForm = (formValues: BookingFormInputs) => {
    // console.log('formValues: ', formValues);

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
    } else if (Object.keys(selectedSlots).length === 0) {
      toast.error('Please select at least one slot.');
      return false;
    } else if (!selectedDays.length) {
      toast.error('Please select a weekday.');
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

        const trainerRatePerHour = Number(selectedTrainer.fees || 0);
        const weekdaysList = Object.keys(selectedSlots).join(',');

        // // Ensure convertSelectedSlotsToSessions is defined
        // if (typeof convertSelectedSlotsToSessions !== 'function') {
        //   return;
        // }

        // const sessionsList = convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);

        const payload = {
          booking: {
            trainer: formValues.trainerId,
            customer: formValues.customerId,
            bookingType: bookingType,
            startDate:  bookingType === BOOKING_TYPE.WEEKLY ? bookingStartDate : bookingDate,
            endDate: bookingType === BOOKING_TYPE.WEEKLY ? bookingEndDate : bookingDate,
            trainerRatePerHour: trainerRatePerHour,
            weekdays: weekdaysList,
            recurrenceWeeks: reOccuranceEnabled ? reOccuranceWeeks : 0,
            paymentType: paymentType,
            promocode: selectedPromocode?.id || null,
            bookingHours: bookingDetails?.bookingHours || 0,
            bookingAmount: bookingDetails?.bookingAmount || 0,
            totalAmount: bookingDetails?.bookingAmount || 0,
            discount: bookingDetails?.discountAmount || 0,
            netTotalAmount: bookingDetails?.netTotalAmount || 0,

          },
          sessions: selectedBookingSlots,
        };

        // console.log('(submit)Payload: ', payload);

        // console.log("(submit)bookingDetails:", bookingDetails)
        // console.log("(submit)selectedBookingSlots:", selectedBookingSlots)

        await axiosInstance.post('/session-booking', payload);
        toast.success('Booking added successfully');

        // Check if onCreate is defined before calling it
        if (typeof onCreate === 'function') {
          onCreate();
        }
      }
    },
    [
      bookingType,
      paymentType,
      bookingDate,
      bookingStartDate,
      bookingEndDate,
      selectedPromocode,
      selectedSlots,
      selectedTrainer,
      selectedCustomer,
      bookingDetails,
      selectedBookingSlots,
      onCreate
    ]
  );

  // Fetch data on mount

  React.useEffect(() => {
    void fetchTrainers();
    void fetchCustomers();
    void fetchPromocode();
  }, []);

  // React.useEffect(() => {
  //   console.log('Update : selectedDays:: ', selectedDays);
  // }, [selectedDays]);

  // React.useEffect(() => {
  //   console.log('Update : bookingDetails:: ', bookingDetails);
  // }, [bookingDetails]);

  // React.useEffect(() => {
  //   console.log('Update : selectedBookingSlots:: ', selectedBookingSlots);
  // }, [selectedBookingSlots]);

  React.useEffect(() => {
    const trainerRatePerHour = Number(selectedTrainer?.fees || 0);
    const sessions =  convertSelectedSlotsToSessions(selectedSlots, trainerRatePerHour);
    setSelectedBookingSlots(sessions);
  }, [selectedSlots, selectedTrainer, selectedPromocode]);

  React.useEffect(() => {
    setSelectedSlots({});
    setSelectedDays([]);
    filterAvailableTrainerSlotsByReoccurrence();
  }, [availableSlotsWeekly, reOccuranceWeeks, reOccuranceEnabled]);

  React.useEffect(() => {
    if (bookingType === BOOKING_TYPE.ONE_TIME && selectedTrainer && bookingDate) {
      void fetchTrainerSlotsData(selectedTrainer.id.toString(), bookingDate, bookingDate);
    }

    if (bookingType === BOOKING_TYPE.WEEKLY && selectedTrainer && bookingStartDate && bookingEndDate) {
      void fetchTrainerSlotsData(selectedTrainer.id.toString(), bookingStartDate, bookingEndDate);
    }
  }, [selectedTrainer, bookingType, bookingDate, bookingStartDate, bookingEndDate]);

  React.useEffect(() => {
    setBookingDetails({
      bookingType: bookingType,
      selectedTrainer: selectedTrainer,
      selectedCustomer: selectedCustomer,
      bookingDate: bookingDate,
      bookingStartDate: bookingStartDate,
      bookingEndDate: bookingEndDate,
      selectedDays: selectedDays,
      selectedSlots: selectedSlots,
      paymentType: paymentType,
      bookingHours: bookingHours || 0,
      trainerRatePerHour: Number(selectedTrainer?.fees || 0),
      bookingAmount: bookingAmount || 0,
      selectedPromocode: selectedPromocode,
      discountAmount: discountAmount,
      netTotalAmount: netTotalAmount || 0,
    });
  }, [selectedSlots, selectedTrainer, selectedCustomer, netTotalAmount, discountAmount]);

  // Render the dialog
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: 3 }}>
          <Typography sx={{ textAlign: 'center' }} variant="h5">
            Add Booking
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
                        <Avatar
                          src={selectedCustomer.profileImageUrl || '/assets/User@3x-1.png'}
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
                        <Avatar
                          src={selectedTrainer.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
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
                <Tabs
                  value={bookingType}
                  onChange={(e: React.SyntheticEvent, newValue: string) => {
                    handleTabChange(newValue);
                  }}
                  sx={{ width: '100%' }}
                >
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
                        format="DD-MM-YYYY"
                        label="Select date"
                        onChange={(date) => {
                          const bookingSelectedDate = date ? date.toDate() : null;
                          field.onChange(bookingSelectedDate);

                          if (selectedTrainer && bookingSelectedDate) {
                            const startDateOneTime = dayjs(bookingSelectedDate).format('YYYY-MM-DD');
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
                        format="DD-MM-YYYY"
                        label="Start date"
                        onChange={(date) => {
                          const startDateWeeklyOne = date ? date.toDate() : null;
                          field.onChange(startDateWeeklyOne);

                          if (selectedTrainer && startDateWeeklyOne) {
                            const startDateFormatted = dayjs(startDateWeeklyOne).format('YYYY-MM-DD');
                            setBookingStartDate(startDateFormatted);
                            if (dayjs(bookingEndDate).isBefore(dayjs(startDateWeeklyOne))) {
                              setBookingEndDate(startDateFormatted);
                            }
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
                        format="DD-MM-YYYY"
                        label="End date"
                        minDate={dayjs(bookingStartDate).isValid() ? dayjs(bookingStartDate) : undefined} // Ensure minDate is set
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
                        value={(bookingEndDate || field.value) ? dayjs(bookingEndDate||field.value) : dayjs()} // Default to null
                      />
                    )}
                  />
                </Grid>

                <Grid item md={12}>
                  <Grid item md={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reOccuranceEnabled}
                          onChange={(event) => {
                            event.stopPropagation();
                            setReOccuranceEnabled(!reOccuranceEnabled);
                          }}
                        />
                      }
                      label="Re-occurrence every"
                    />
                  </Grid>

                  {reOccuranceEnabled && (
                    <Grid item md={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Button variant="outlined" onClick={decreaseReoccurrence} sx={{ minWidth: '40px' }}>
                            -
                          </Button>
                        </Grid>

                        <Grid item>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
                            {reOccuranceWeeks} Week{reOccuranceWeeks > 1 ? 's' : ''}
                          </Typography>
                        </Grid>

                        <Grid item>
                          <Button variant="outlined" onClick={increaseReoccurrence} sx={{ minWidth: '40px' }}>
                            +
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
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
              {availableSlotsWeeklyByFilter.length > 0 ? (
                availableSlotsWeeklyByFilter
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
                        onChange={(event, newValue) => {
                          handleSessionSlotChange(weekDaySlot.weekday, newValue);
                        }}
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

            {availableSlotsWeeklyByFilter.length ? (
              <Grid item xs={12} md={5.8}>
                <Controller
                  control={control}
                  name="promocodeId"
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.promocodeId)}>
                      <InputLabel>Promocode</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const promocodeId = Number(e.target.value);
                          field.onChange(promocodeId);
                          handlePromocodeChange(promocodeId);
                        }}
                        label="Apply Promocode"
                      >
                        <Option value="" disabled>
                          <em>Select Promocode</em>
                        </Option>
                        {promocodeOptions.map((promocode) => (
                          <Option key={promocode.id} value={promocode.id}>
                            {promocode.codeName}
                          </Option>
                        ))}
                      </Select>
                      {errors.promocodeId && <FormHelperText>{errors.promocodeId.message}</FormHelperText>}

                      {/* Cancel Button */}
                      {field.value && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            field.onChange(null);
                            handlePromocodeChange(null); // or any other logic you need
                          }}
                          sx={{ marginTop: 2 }} // Add some spacing
                        >
                          Remove
                        </Button>
                      )}
                    </FormControl>
                  )}
                />

                {selectedPromocode && (
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
                        <Grid item md={8} alignContent={'center'}>
                          {/* <Typography variant="subtitle1">{selectedPromocode.codeName}</Typography> */}

                          {/* <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            {selectedPromocode.description ? selectedPromocode.description : ''}
                          </Typography> */}

                          <Typography variant="subtitle1"> Total Discount {formatAmount(discountAmount)}</Typography>
                        </Grid>
                      </Grid>

                      {/* Add other fields as necessary */}
                    </CardContent>
                  </Card>
                )}
              </Grid>
            ) : (
              <Typography>No available promocodes</Typography>
            )}
          </Grid>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <PaymentToggle netTotalAmount={netTotalAmount} setPaymentType={setPaymentType} />
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
      <BookingPreviewDialog isOpen={isPreviewOpen} handleClose={handlePreviewClose} bookingDetails={bookingDetails} />
    </Dialog>
  );
}
