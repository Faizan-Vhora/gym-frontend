import * as React from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material'; // Importing as a type

interface TrainersFiltersProps {
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
}

export function TrainersFilters({ onFilterChange, onStatusChange }: TrainersFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('ALL');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newFilter = event.target.value;
    setSearchTerm(newFilter);
    onFilterChange(newFilter);
  };

  const handleStatusChange = (event: SelectChangeEvent): void => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <TextField label="Search" value={searchTerm} onChange={handleFilterChange} variant="outlined" fullWidth />
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
