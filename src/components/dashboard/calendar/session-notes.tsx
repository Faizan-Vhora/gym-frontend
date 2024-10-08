import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { BookingSessionEntry } from '../booking/view/booking-sessions/booking-session-table';

interface SessionNotesFormProps {
  sessionObj: BookingSessionEntry;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { notes: string }) => void;
}

const SessionNotesForm: React.FC<SessionNotesFormProps> = ({ sessionObj, open, onClose, onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<{ notes: string | null }>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionObj) {
      setValue('notes', sessionObj.notes);
      setLoading(false);
    }
  }, [sessionObj, setValue]);

  const onSubmitForm = (data: { notes: string | null }) => {
    if (data.notes) {
      onSubmit({
        notes: data.notes,
      });
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notes</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Controller
            name="notes"
            control={control}
            defaultValue=""
            rules={{ required: 'Notes are required' }}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                error={!!errors.notes}
                helperText={errors.notes ? errors.notes.message : ''}
                placeholder="Enter your notes here..."
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmitForm)} color="primary" disabled={!!errors.notes || loading}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionNotesForm;
