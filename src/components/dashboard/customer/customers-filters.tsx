import * as React from 'react';
import { FormControl, Grid, InputLabel, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));

const StyledInput = styled(OutlinedInput)(({ theme }) => ({
  maxWidth: '500px',
  '& .MuiInputAdornment-root': {
    color: theme.palette.text.secondary,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  maxWidth: '300px',
  '& .MuiSelect-select': {
    padding: theme.spacing(1),
  },
}));

interface CustomersFiltersProps {
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
}

export function CustomersFilters({ onFilterChange, onStatusChange }: CustomersFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [status, setStatus] = React.useState('ALL');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    setSearchTerm(newFilter);
    onFilterChange(newFilter);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        {/* <Stack direction="row" spacing={5} sx={{ marginBottom: 3 }}> */}
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
        {/* </Stack> */}
      </Grid>
    </Grid>
  );
}
