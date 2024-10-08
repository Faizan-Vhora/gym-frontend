import * as React from 'react';
import { useState } from 'react';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';
import { BOOKING_STATUS_OPTIONS, BOOKING_TYPE_OPTIONS } from '@/utils/constant';

interface SupportFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: string) => void;
  onBookingTypeChange: (bookingType: string) => void;
}

export function BookingFilters({
  onSearchChange,
  onStatusChange,
  onBookingTypeChange,
}: SupportFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('All');
  const [bookingType, setBookingType] = useState('All');

  // Create a debounced version of the search handler
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300), // Adjust the debounce delay as needed
    [onSearchChange] // Dependency array
  );

  // Clean up the debounce function on component unmount
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

  return (
    <Grid container spacing={2}>
      <Grid item md={4} xs={12}>
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
                  <XIcon size={15} /> {/* Adjust size as needed */}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item md={4} xs={12}>
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
      <Grid item md={4} xs={12}>
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
    </Grid>
  );
}
