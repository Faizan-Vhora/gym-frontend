import * as React from 'react';
import { useState } from 'react';
import { BOOKING_STATUS_OPTIONS, BOOKING_TYPE_OPTIONS } from '@/utils/constant';
import { DATE_FORMAT } from '@/utils/date-utils';
import {
  Autocomplete,
  Box,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Import DatePicker
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react

import dayjs, { Dayjs } from 'dayjs'; // Import dayjs
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';

interface SupportFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onBookingTypeChange: (bookingType: string) => void;
  onTrainerIdChange: (trainerId: string) => void;
  onCustomerIdChange: (customerId: string) => void;
  onStartDateChange: (startDate: string) => void;
  onStatusChange: (status: string) => void;
  onEndDateChange: (endDate: string) => void;
}

export function BookingFilters({
  onSearchChange,
  onBookingTypeChange,
  onTrainerIdChange,
  onCustomerIdChange,
  onStartDateChange,
  onStatusChange,
  onEndDateChange,
}: SupportFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('All');
  const [bookingType, setBookingType] = useState('All');
  const [trainerId, setTrainerId] = useState('All');
  const [customerId, setCustomerId] = useState('All');

  const [trainerOptions, setTrainerOptions] = useState<Trainer[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [cleared, setCleared] = React.useState<boolean>(false);

  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
    [onSearchChange]
  );

  const fetchTrainers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ data: Trainer[] }>('/users/trainer/dropdown');
      setTrainerOptions(response.data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data.';
      toast.error(`Error fetching trainers: ${errorMessage}`);
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ data: Customer[] }>('/users/customer/dropdown');
      setCustomerOptions(response.data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data.';
      toast.error(`Error fetching customers: ${errorMessage}`);
    }
  };

  React.useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return;
  }, [cleared]);

  React.useEffect(() => {
    void fetchTrainers(); // Awaiting the promise
    void fetchCustomers(); // Awaiting the promise
  }, []);

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  const handleStatusChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  const handleBookingTypeChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setBookingType(value);
    onBookingTypeChange(value);
  };

  const handleTrainerIdChange = (trainerID: string): void => {
    setTrainerId(trainerID);
    onTrainerIdChange(trainerID);
  };

  const handleCustomerIdChange = (memberId: string): void => {
    setCustomerId(memberId);
    onCustomerIdChange(memberId);
  };

  const handleStartDateChange = (date: Dayjs | null): void => {
    setStartDate(date);
    onStartDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '');

    if (endDate?.isBefore(date)) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date: Dayjs | null): void => {
    setEndDate(date);
    onEndDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '');
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <TextField
          fullWidth
          label="Search by Name or Email or Phone Number"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClear} edge="end">
                  <XIcon size={15} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item md={3} xs={12}>
        <Box display="flex" alignItems="center">
          <DatePicker
            format={DATE_FORMAT}
            views={['year', 'month', 'day']}
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
              },
              field: {
                clearable: true,
                onClear: () => {
                  setCleared(true);
                },
              },
            }}
          />
        </Box>
      </Grid>

      <Grid item md={3} xs={12}>
        <Box display="flex" alignItems="center">
          <DatePicker
            format={DATE_FORMAT}
            views={['year', 'month', 'day']}
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate ?? undefined} // Use nullish coalescing
            slotProps={{
              textField: {
                fullWidth: true,
              },
              field: {
                clearable: true,
                onClear: () => {
                  setCleared(true);
                },
              },
            }}
          />
        </Box>
      </Grid>

      <Grid item md={3} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Booking Type</InputLabel>
          <Select value={bookingType} onChange={handleBookingTypeChange} label="bookingType">
            <MenuItem value="All">All</MenuItem>
            {BOOKING_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item md={3} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange} label="Status">
            <MenuItem value="All">All</MenuItem>
            {BOOKING_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item md={3} xs={12}>
        <FormControl fullWidth variant="outlined">
          <Autocomplete
            options={trainerOptions}
            getOptionLabel={(option) =>
              option.memberId && option.fullName ? `${option.memberId} | ${option.fullName}` : 'All'
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={trainerOptions.find((option) => String(option.id) === trainerId) || null}
            onChange={(event, value) => {
              const selectedTrainerId = value ? String(value.id) : 'All';
              handleTrainerIdChange(selectedTrainerId);
            }}
            renderInput={(params) => <TextField {...params} label="Trainer" variant="outlined" />}
          />
        </FormControl>
      </Grid>

      <Grid item md={3} xs={12}>
        <FormControl fullWidth variant="outlined">
          <Autocomplete
            options={customerOptions}
            getOptionLabel={(option) =>
              option.memberId && option.fullName ? `${option.memberId} | ${option.fullName}` : 'All'
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={customerOptions.find((option) => String(option.id) === customerId) || null}
            onChange={(event, value) => {
              const selectedMemberId = value ? String(value.id) : 'All';
              handleCustomerIdChange(selectedMemberId);
            }}
            renderInput={(params) => <TextField {...params} label="Member" variant="outlined" />}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
