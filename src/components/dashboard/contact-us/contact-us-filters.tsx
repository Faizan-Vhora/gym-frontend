import * as React from 'react';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

interface ContactUsFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: string) => void;
  onFromChange: (from: string) => void;
}

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'UnResolved', label: 'UnResolved' },
];

const fromOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'User', label: 'User' },
  { value: 'Trainer', label: 'Trainer' },
  { value: 'Web', label: 'Web' },
];

export function ContactUsFilters({
  onSearchChange,
  onStatusChange,
  onFromChange,
}: ContactUsFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const [from, setFrom] = React.useState('ALL');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setStatus(value);
    onStatusChange(value);
  };

  const handleFromChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setFrom(value);
    onFromChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={4} xs={12}>
        <TextField
          fullWidth
          label="Search by Name or Email"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
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
      <Grid item md={4} xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>From</InputLabel>
          <Select value={from} onChange={handleFromChange} label="From">
            {fromOptions.map((option) => (
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
