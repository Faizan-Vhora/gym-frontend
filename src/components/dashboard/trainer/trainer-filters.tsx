import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
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
  maxWidth: '200px',
  '& .MuiSelect-select': {
    padding: theme.spacing(1),
  },
}));

interface TrainersFiltersProps {
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
}

export function TrainersFilters({ onFilterChange, onStatusChange }: TrainersFiltersProps): React.JSX.Element {
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
    <StyledCard>
      <StyledInput
        value={searchTerm}
        onChange={handleFilterChange}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
      />
      <StyledSelect value={status} onChange={handleStatusChange}>
        <MenuItem value="ALL">All</MenuItem>
        <MenuItem value="1">Active</MenuItem>
        <MenuItem value="2">Inactive</MenuItem>
        {/* Add other status options here */}
      </StyledSelect>
    </StyledCard>
  );
}
