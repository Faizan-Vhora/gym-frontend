'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react

import dayjs, { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';
import { useForm } from 'react-hook-form';

import TimeFilter from '../reports/checkin-report/checkin-filter';
import DateRangeFilter from '../reports/common-filters/date-range-filter';

interface CheckinFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onUserTypeChange: (userType: string) => void;
  onStatusChange: (status: string) => void;
  onDateChange: (dateRange: DateRange<Dayjs>) => void;
  onCheckInTimeChange: (time: Date | null, isCheckIn: boolean) => void;
  onCheckOutTimeChange: (time: Date | null, isCheckIn: boolean) => void;
}

export default function CheckinFilters({
  onSearchChange,
  onUserTypeChange,
  onStatusChange,
  onDateChange,
  onCheckInTimeChange,
  onCheckOutTimeChange,
}: CheckinFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [userType, setUserType] = React.useState(searchParams.get('userType') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');
  const rawDateRange = searchParams.get('dateRange');
  const [start, end] = rawDateRange ? rawDateRange.split(',') : [null, null];
  const initialDateRange: DateRange<Dayjs> = [start ? dayjs(start) : null, end ? dayjs(end) : null];
  const [dateRange, setDateRange] = React.useState<DateRange<Dayjs>>(initialDateRange);
  const { control } = useForm();

  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300), // Adjust the debounce delay as needed
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

  const handleUserTypeChange = (event: SelectChangeEvent): void => {
    const newUserType = event.target.value;
    setUserType(newUserType);
    onUserTypeChange(newUserType);
  };

  const handleStatusChange = (event: SelectChangeEvent): void => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  const handleDateChange = (dateRangeS: DateRange<Dayjs>) => {
    setDateRange(dateRangeS);
    onDateChange(dateRangeS);
  };

  const handleTimeChange = (time: Date | null, isCheckIn: boolean) => {
    // const formattedTime = time ? dayjs(time).format('HH:mm:ss') : null;
    if (isCheckIn) {
      onCheckInTimeChange(time, isCheckIn);
    } else {
      onCheckOutTimeChange(time, isCheckIn);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={4} sm={6} xs={12}>
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
                  <XIcon size={15} /> {/* Adjust size as needed */}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item md={4} sm={6} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>User Type</InputLabel>
          <Select label="User Type" value={userType} onChange={handleUserTypeChange} variant="outlined" fullWidth>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="3">Member</MenuItem>
            <MenuItem value="2">Trainer</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4} sm={6} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={handleStatusChange} variant="outlined" fullWidth>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4} xs={12}>
        <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} />
      </Grid>
      <Grid item md={4} xs={12}>
        <Grid container spacing={2}>
          <Grid item md={6}>
            <TimeFilter
              label="Start CheckIn Time"
              name="checkInTime"
              control={control}
              onTimeChange={(time) => {
                handleTimeChange(time, true);
              }} // Pass true for check-in
            />
          </Grid>
          <Grid item md={6}>
            <TimeFilter
              label="End CheckIn Time"
              name="checkOutTime"
              control={control}
              onTimeChange={(time) => {
                handleTimeChange(time, false);
              }} // Pass false for check-out
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
