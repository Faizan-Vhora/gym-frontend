import * as React from 'react';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface MembershipPlanFiltersProps {
  onSearchChange: (searchTerm: string) => void;

  onStatusChange: (status: string) => void;
}

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export function MembershipPlanFilters({
  onSearchChange,
  onStatusChange,
}: MembershipPlanFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');

  const [status, setStatus] = React.useState('ALL');

  //Create a debounced version of the search handler
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  // Handle status change
  const handleStatusChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <TextField
          fullWidth
          label="Search by Title"
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
      <Grid item md={6} xs={12}>
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
