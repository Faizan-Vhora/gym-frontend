import React from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

interface TrainerFilterProps {
  onFilterChange: (filters: { status?: string; duration?: string }) => void;
}

export function TrainerFilter({ onFilterChange }: TrainerFilterProps): React.JSX.Element {
  const [status, setStatus] = React.useState<string>('');
  const [duration, setDuration] = React.useState<string>('');

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setStatus(newStatus);
    onFilterChange({ status: newStatus, duration });
  };

  const handleDurationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newDuration = event.target.value as string;
    setDuration(newDuration);
    onFilterChange({ status, duration: newDuration });
  };

  const handleClearFilters = () => {
    setStatus('');
    setDuration('');
    onFilterChange({ status: '', duration: '' });
  };

  return (
    <Stack spacing={2} direction="row" mb={2}>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select value={status} onChange={handleStatusChange} label="Status">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Duration</InputLabel>
        <Select value={duration} onChange={handleDurationChange} label="Duration">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Per Hour">Per Hour</MenuItem>
          <MenuItem value="Per Day">Per Day</MenuItem>
          <MenuItem value="Per Week">Per Week</MenuItem>
          <MenuItem value="Per Month">Per Month</MenuItem>
          <MenuItem value="Per Year">Per Year</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="secondary" onClick={handleClearFilters}>
        Clear Filters
      </Button>
    </Stack>
  );
}
