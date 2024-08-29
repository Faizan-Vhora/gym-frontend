import * as React from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';

interface FaqFiltersProps {
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

export function FaqFilters({ onTypeChange, onStatusChange }: FaqFiltersProps): React.JSX.Element {
  const [type, setType] = React.useState('ALL');
  const [status, setStatus] = React.useState('ALL');

  const handleTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setType(value);
    onTypeChange(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
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
