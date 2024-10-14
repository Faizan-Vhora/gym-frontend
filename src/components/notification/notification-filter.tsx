import * as React from 'react';
import { useState } from 'react';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface NotificationFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onFromChange: (from: string) => void;
}

export function NotificationFilters({ onSearchChange, onFromChange }: NotificationFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [from, setFrom] = useState('All');

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

  const handleFromChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setFrom(value);
    onFromChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <TextField
          fullWidth
          label="Search by title, Name or Email"
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
      {/* <Grid item md={6} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>From</InputLabel>
          <Select value={from} onChange={handleFromChange} label="From">
            <MenuItem value="All">All</MenuItem>
            {SUPPORT_TICKET_USER_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid> */}
    </Grid>
  );
}
