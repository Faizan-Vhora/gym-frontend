'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { NOTIFICATION_EVENT_OPTIONS } from '@/utils/constant';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface NotificationFiltersProps {
  onNotificationTypeChange: (type: string) => void;
}

export default function NotificationFilters({ onNotificationTypeChange }: NotificationFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();

  const [notificationType, setNotificationType] = React.useState(searchParams.get('notificationEvent') || 'ALL');

  const handleTypeChange = (event: SelectChangeEvent): void => {
    const newType = event.target.value;
    setNotificationType(newType);
    onNotificationTypeChange(newType);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel>Notification Type</InputLabel>
      <Select
        label="Notification Type"
        value={notificationType}
        onChange={handleTypeChange}
        variant="outlined"
        fullWidth
      >
        <MenuItem value="ALL">All</MenuItem>
        {NOTIFICATION_EVENT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
