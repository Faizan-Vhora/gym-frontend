import React from 'react';
import { MEMBERSHIP_PAYMENT_STATUS_DETAILS } from '@/utils/constant';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

interface UpdateMembershipStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { status: string }) => void; // Adjusted to pass status value
  //   defaultStatus: string | null;
}

export function UpdateMembershipStatusDialog({
  open = false,
  onClose,
  onSubmit,
  //   defaultStatus,
}: UpdateMembershipStatusDialogProps): React.JSX.Element {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      status: '', // Default value for the dropdown
    },
  });

  const handleFormSubmit = (data: { status: string }) => {
    onSubmit(data); // Pass the selected status
    onClose(); // Close the dialog after submission
  };

  //   const defaultStatusValue = defaultStatus ? BOOKING_SESSION_PAYMENT_STATUS_DETAILS[defaultStatus]?.value : '';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Choose Booking Status</DialogTitle>
      <DialogContent>
        <Stack spacing={5} margin={3}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={field.value}
                  onChange={field.onChange} // Handle selection change
                >
                  {Object.keys(MEMBERSHIP_PAYMENT_STATUS_DETAILS).map((statusKey) => (
                    <MenuItem key={statusKey} value={MEMBERSHIP_PAYMENT_STATUS_DETAILS[statusKey].value}>
                      {MEMBERSHIP_PAYMENT_STATUS_DETAILS[statusKey].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
