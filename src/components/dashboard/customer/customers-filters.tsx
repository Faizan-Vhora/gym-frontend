import * as React from 'react';
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import type { MembershipPlans } from '../membership-plan/membership-plan-table';

interface CustomersFiltersProps {
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
  onMembershipTypeChange: (membershipType: string) => void; // New prop for membership type change
}

export function CustomersFilters({
  onFilterChange,
  onStatusChange,
  onMembershipTypeChange,
}: CustomersFiltersProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const [membershipType, setMembershipType] = React.useState('ALL'); // State for membership type
  const [membershipTypes, setMembershipTypes] = React.useState<MembershipPlans[]>([]);

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

  const handleMembershipTypeChange = (event: SelectChangeEvent): void => {
    const newMembershipType = event.target.value;
    setMembershipType(newMembershipType);
    onMembershipTypeChange(newMembershipType); // Call the handler passed via props
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onFilterChange('');
  };

  React.useEffect(() => {
    const fetchMembershipTitles = async () => {
      try {
        const response = await axiosInstance.get<{ data: MembershipPlans[] }>('/membership-types/dropdown'); // Type the response
        setMembershipTypes(response.data.data);
      } catch (err: unknown) {
        let errorMessage: string;
        if (typeof err === 'string') {
          errorMessage = err;
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        toast.error(errorMessage);
      }
    };

    void fetchMembershipTitles();
  }, []);
  return (
    <Grid container spacing={2}>
      <Grid item md={4} xs={12}>
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
      <Grid item md={4} xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange} label="Status">
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="2">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4} xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>Membership Plan</InputLabel>
          <Select value={membershipType} onChange={handleMembershipTypeChange} label="Membership Type">
            <MenuItem value="ALL">All</MenuItem>
            {membershipTypes.map((type: MembershipPlans) => (
              <MenuItem key={type.id} value={type.id}>
                {type.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
