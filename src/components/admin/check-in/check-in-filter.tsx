'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface CheckinFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onUserTypeChange: (userType: string) => void;
  onStatusChange: (status: string) => void;
}

export default function CheckinFilters({
  onSearchChange,
  onUserTypeChange,
  onStatusChange,
}: CheckinFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [userType, setUserType] = React.useState(searchParams.get('userType') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

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
    </Grid>
  );
}
