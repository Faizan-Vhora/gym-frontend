'use client';

import * as React from 'react';
import { BOOKING_SESSION_STATUS_OPTIONS } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { X as XIcon } from '@phosphor-icons/react';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { Option } from '@/components/core/option';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';
import type { ViewMode } from './types';

export interface ToolbarProps {
  date: Date;
  onAdd?: () => void;
  onViewChange?: (view: ViewMode) => void;
  view: ViewMode;
  onSearchChange: (searchTerm: string) => void;
  handleTrainerChange: (selectedTrainer: number) => void;
  handleMemberChange: (selectedMember: number) => void;
  onStatusChange: (status: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function Toolbar({
  date,
  onAdd,
  onViewChange,
  view,
  onSearchChange,
  handleTrainerChange,
  handleMemberChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
}: ToolbarProps): React.JSX.Element {
  const handleViewChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onViewChange?.(event.target.value as ViewMode);
    },
    [onViewChange]
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTrainer, setSelectedTrainer] = React.useState<string>('');
  const [selectedMember, setSelectedMember] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null); // Change to Dayjs
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null); // Change to Dayjs

  // Trainer API
  interface ErrorDetail {
    code?: string;
    message?: string;
  }

  interface TrainerResponseData {
    data: Trainer[];
    errors?: ErrorDetail;
  }

  const fetchTrainers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<TrainerResponseData>('/users/trainer/dropdown');

      const responseData = response.data.data;
      if (Array.isArray(responseData)) {
        setTrainers(responseData);
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? `Error fetching trainers: ${err.message}` : 'Failed to load data.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchTrainers();
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

  // Search logic with debounce
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
    [onSearchChange]
  );

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  const handleTrainerSelect = (event: SelectChangeEvent): void => {
    const trainerId = Number(event.target.value);
    setSelectedTrainer(event.target.value);
    handleTrainerChange(trainerId);
  };

  const handleMemberSelect = (event: SelectChangeEvent): void => {
    const memberId = Number(event.target.value);
    setSelectedMember(event.target.value);
    handleMemberChange(memberId);
  };

  const handleStatusChange = (event: SelectChangeEvent): void => {
    const newStatus = event.target.value;
    // setStatus(newStatus);
    onStatusChange(newStatus);
    setSelectedStatus(newStatus);
  };

  const handleStartDateChange = (newStartDate: Dayjs | null): void => {
    setStartDate(newStartDate);
    onStartDateChange(newStartDate ? dayjs(newStartDate).format('YYYY-MM-DD') : '');
    // Reset endDate if it's before the new start date
    if (newStartDate && endDate?.isBefore(newStartDate)) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (newEndDate: Dayjs | null): void => {
    setEndDate(newEndDate);
    onEndDateChange(newEndDate ? dayjs(newEndDate).format('YYYY-MM-DD') : '');
  };

  const handleClearStartDate = (): void => {
    setStartDate(null);
    onStartDateChange('');
  };

  const handleClearEndDate = (): void => {
    setEndDate(null);
    onEndDateChange('');
  };

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      <Stack flexDirection={'row'} columnGap={1}>
        <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
          {dayjs(date).format('MMMM')}
        </Typography>
        <Typography sx={{ fontWeight: 400 }} variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
          {dayjs(date).format('YYYY')}
        </Typography>
      </Stack>

      <Grid container spacing={2} rowGap={2} alignItems={'center'}>
        {/* Search Field */}
        <Grid item md={3} sm={6} xs={12}>
          <TextField
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
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
        <Grid item md={3} sm={6} xs={12}>
          {/* Trainer Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Trainers</InputLabel>
            <Select value={selectedTrainer} onChange={handleTrainerSelect} fullWidth label="Trainers">
              <MenuItem value="All">All</MenuItem>
              {trainers.map((trainer) => (
                <Option key={trainer.id} value={trainer.id}>
                  {trainer.fullName}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          {/* Member Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Members</InputLabel>
            <Select value={selectedMember} onChange={handleMemberSelect} fullWidth label="Members">
              <MenuItem value="All">All</MenuItem>

              {customers.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.fullName}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          {/* View Selection */}
          <Select
            name="view"
            onChange={handleViewChange}
            style={{ fontFamily: '"Audiowide", sans-serif' }}
            sx={{ minWidth: '100%', order: { xs: -1, md: 0 } }}
            value={view}
          >
            <Option value="dayGridMonth">Month</Option>
            <Option value="timeGridWeek">Week</Option>
            <Option value="timeGridDay">Day</Option>
            <Option value="listWeek">Agenda</Option>
          </Select>
        </Grid>

        <Grid item md={3} sm={6} xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={selectedStatus} onChange={handleStatusChange} label="Status">
              {/* Option for 'All' */}
              <MenuItem value="ALL">All</MenuItem>
              {BOOKING_SESSION_STATUS_OPTIONS.map((sessionStatus) => (
                <MenuItem key={sessionStatus.value} value={sessionStatus.value}>
                  {sessionStatus.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <LocalizationProvider dateAdapter={AdapterDayjs} >
          <Grid item md={3} sm={6} xs={12}>
            {/* Start Date Picker */}
            <DatePicker
              label="Start Date"
              value={startDate ? dayjs(startDate) : null}
              onChange={handleStartDateChange}
              slotProps={{ textField: { fullWidth: true } }}
              
            />
            {startDate && (
              <IconButton onClick={handleClearStartDate} edge="end">
                <XIcon size={20} /> {/* Adjust icon size as needed */}
              </IconButton>
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {/* End Date Picker */}
            <DatePicker
             
              label="End Date"
              value={endDate ? dayjs(endDate) : null}
              onChange={handleEndDateChange}
              minDate={startDate ? startDate : undefined}
              slotProps={{ textField: { fullWidth: true } }}
            />
            {endDate && (
              <IconButton onClick={handleClearEndDate} edge="end">
                <XIcon size={20} /> {/* Adjust icon size as needed */}
              </IconButton>
            )}
          </Grid>
        </LocalizationProvider>

        <Grid item md={2} sm={6} xs={12} sx={{marginLeft:'auto'}}>
          {/* Add Booking Button */}
          <Button
            onClick={onAdd}
            className="common-button"
            startIcon={<PlusIcon />}
            sx={{marginLeft:'auto' }}
            variant="contained"
            style={{ fontFamily: '"Audiowide", sans-serif' }}
          >
            New Booking
          </Button>
        </Grid>
      </Grid>
      {loading && <CustomLoader />}
    </Stack>
  );
}
