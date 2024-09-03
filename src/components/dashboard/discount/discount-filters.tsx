import * as React from 'react';
import { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface DiscountFilterProps {
  onFilterChange: (filterType: string) => void;
}

export function DiscountFilter({ onFilterChange }: DiscountFilterProps): React.JSX.Element {
  const [filter, setFilter] = useState<string>('All');

  const handleFilterChange = (event: SelectChangeEvent): void => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
    onFilterChange(selectedFilter);
  };

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel>Status</InputLabel>
      <Select value={filter} onChange={handleFilterChange} label="Status">
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
        <MenuItem value="expired">Expired</MenuItem>
      </Select>
    </FormControl>
  );
}
