import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs'; // Assuming you have dayjs installed
import { Controller, useForm } from 'react-hook-form';

interface ChooseMembershipDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { startDate: string | null }) => void; // Adjusted to the correct structure
}

export function ChooseMembershipDialog({
  open = false,
  onClose,
  onSubmit,
}: ChooseMembershipDialogProps): React.JSX.Element {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      startDate: dayjs().toDate(),
    },
  });

  const handleFormSubmit = (data: { startDate: Date | null }) => {
    // Correct the type here
    // Ensure startDate is passed only if a value is selected
    const formattedData = {
      startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : null, // Format if present
    };
    onSubmit(formattedData); // Call onSubmit with the form data
    onClose(); // Close the dialog after submission
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Choose Date to start Membership Plan</DialogTitle>
      <DialogContent>
        <Stack spacing={5} margin={3}>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                sx={{ width: '100%' }}
                disablePast
                label="Start date"
                onChange={(date) => {
                  const startDate = date ? date.toDate() : null;
                  field.onChange(startDate); // Pass the selected date or null
                }}
                value={field.value ? dayjs(field.value) : dayjs()} // Set the value or null
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
