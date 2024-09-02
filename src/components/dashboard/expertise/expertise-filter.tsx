'use client';

import * as React from 'react';
import { Grid, MenuItem, Select, TextField } from '@mui/material';

interface ExpertiseFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: string) => void;
}

export default function ExpertiseFilters({ onSearchChange, onStatusChange }: ExpertiseFiltersProps): React.JSX.Element {
  // component implementation

  // export default function ExpertiseFilters({ onSearchChange, onStatusChange }: ExpertiseFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [status, setStatus] = React.useState('ALL');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        {/* <Stack direction="row" spacing={5} sx={{ marginBottom: 3 }}> */}
        <TextField label="Search" value={searchTerm} onChange={handleSearchChange} variant="outlined" fullWidth />
      </Grid>
      <Grid item md={6} xs={12}>
        <Select label="Status" value={status} onChange={handleStatusChange} variant="outlined" fullWidth>
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
        {/* </Stack> */}
      </Grid>
    </Grid>
  );
}
