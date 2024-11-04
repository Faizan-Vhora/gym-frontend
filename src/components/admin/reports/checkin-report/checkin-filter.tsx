import React from 'react';
import { FormControl } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Control, Controller } from 'react-hook-form';

type FormValues = Record<string, Date | null>;

interface TimeFilterProps {
  label: string;
  name: string;
  control: Control<FormValues>;
  required?: boolean;
  onTimeChange?: (time: Date | null) => void; // New prop to handle time change
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  label,
  name,
  control,
  required = false,
  onTimeChange, // Destructure the new prop
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <FormControl fullWidth required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TimePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue: Dayjs | null) => {
              field.onChange(newValue ? newValue.toDate() : null); // Update field value
              if (onTimeChange) {
                onTimeChange(newValue ? newValue.toDate() : null); // Call onTimeChange if provided
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(fieldState.error),
                helperText: fieldState.error?.message,
              },
            }}
          />
        )}
      />
    </FormControl>
  </LocalizationProvider>
);

export default TimeFilter;
