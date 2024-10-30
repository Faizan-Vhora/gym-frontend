import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import axiosInstance from '@/lib/axios';

import { MembershipPlans } from '../membership-report/membership-report-table';

interface SubscriptionFiltersProps {
  onMembershipTypeChange: (membershipType: string) => void; // New prop for membership type change
}

export function SubscriptionFilters({ onMembershipTypeChange }: SubscriptionFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [membershipType, setMembershipType] = React.useState(searchParams.get('membershipId') || ''); // State for membership type
  const [membershipTypes, setMembershipTypes] = React.useState<MembershipPlans[]>([]);

  const handleMembershipTypeChange = (event: SelectChangeEvent): void => {
    const newMembershipType = event.target.value;
    setMembershipType(newMembershipType);
    onMembershipTypeChange(newMembershipType); // Call the handler passed via props
  };

  React.useEffect(() => {
    const fetchMembershipTitles = async () => {
      try {
        const response = await axiosInstance.get<{ data: MembershipPlans[] }>('/membership-types/dropdown'); // Type the response
        setMembershipTypes(response.data.data);
      } catch (err: unknown) {
        err instanceof Error ? err.message : 'An unexpected error occurred';
      }
    };

    void fetchMembershipTitles();
  }, []);

  return (
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
  );
}
