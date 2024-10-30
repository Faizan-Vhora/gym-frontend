import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material'; // Importing as a type
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface TrainersFiltersProps {
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
}

export function TrainersFilters({ onFilterChange, onStatusChange }: TrainersFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState<string>(searchParams.get('search') || '');
  const [status, setStatus] = React.useState<string>(searchParams.get('status') || 'ALL');

  // Create a debounced version of the search handler
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onFilterChange(value);
    }, 300), // Adjust the debounce delay as needed
    [onFilterChange]
  );

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newFilter = event.target.value;
    setSearchTerm(newFilter);
    debouncedSearch(newFilter);
  };

  const handleStatusChange = (event: SelectChangeEvent): void => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onFilterChange('');
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={handleFilterChange}
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
      <Grid item md={6} xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange} label="Status">
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="2">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
