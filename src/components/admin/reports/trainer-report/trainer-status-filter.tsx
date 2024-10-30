import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface StatusFiltersProps {
  onStatusChange: (status: string) => void;
}

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: '1', label: 'Active' },
  { value: '2', label: 'Inactive' },
];

export function TrainerStatusFilters({ onStatusChange }: StatusFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

  // Handle status change
  const handleStatusChange = (e: SelectChangeEvent): void => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  return (
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
  );
}
