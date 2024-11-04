import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 99999 }}>
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
                error={Boolean(errors.notes)}
                helperText={errors.notes ? errors.notes.message : ''}
                placeholder="Enter your notes here..."
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            border: '1px solid',
            borderColor: '#d0021b',
            color: '#d0021b',
            fontFamily: 'Audiowide, sans-serif !important',
            transform: 'skewX(-20deg)',
            '&:hover': {
              borderColor: 'darkred',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmitForm)}
          className="common-button"
          disabled={Boolean(errors.notes) || loading}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionNotesForm;
