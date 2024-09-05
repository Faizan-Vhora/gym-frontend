import * as React from 'react';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface FaqFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
}

const typeOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'user', label: 'User' },
];

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export function FaqFilters({ onSearchChange, onTypeChange, onStatusChange }: FaqFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [type, setType] = React.useState('ALL');
  const [status, setStatus] = React.useState('ALL');

  //Create a debounced version of the search handler
  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        onSearchChange(value);
      }, 300), // Adjust the debounce delay as needed
    [onSearchChange] // Ensure onFilterChange is included as a dependency
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  const handleTypeChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setType(value);
    onTypeChange(value);
  };

  // Handle status change
  const handleStatusChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={4} xs={12}>
        <TextField
          fullWidth
          label="Search by Questions"
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
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={handleTypeChange} label="Type">
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange} label="Status">
            {statusOptions.map((option) => (
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
