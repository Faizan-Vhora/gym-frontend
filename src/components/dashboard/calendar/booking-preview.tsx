// BookingPreviewDialog.js
import React from 'react';
import {
  Box,
  Button,
  Dialog,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import PaymentToggle from './payment-toggle';

interface Slot {
  startTime: string;
  endTime: string;
}

// Define types for selected slots (key-value pair where the key is the date and the value is an array of slots)
interface SelectedSlots {
  [date: string]: Slot[];
}

// Define the props interface
interface BookingPreviewDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedCustomer: { fullName: string } | null;
  selectedTrainer: { fullName: string } | null;
  selectedSlots: SelectedSlots;
  formatDate: (date: string) => string;
  getTotalHours: number;
  bookingAmount: number;
}

const BookingPreviewDialog: React.FC<BookingPreviewDialogProps> = ({
  isOpen,
  handleClose,
  selectedCustomer,
  selectedTrainer,
  selectedSlots,
  formatDate,
  getTotalHours,
  bookingAmount,
}) => {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={isOpen}>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: 'center' }} variant="h5">
          Booking Preview
        </Typography>
      </Box>
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Customer Info */}
        <Typography variant="subtitle1">Customer: {selectedCustomer?.fullName || 'Not selected'}</Typography>
        <Typography variant="subtitle1">Trainer: {selectedTrainer?.fullName || 'Not selected'}</Typography>

        {/* Booking Type Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Booking Type
          </Typography>

          <Stack spacing={1}>
            {Object.keys(selectedSlots).map((date) => (
              <div key={date}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Slots</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(selectedSlots).map((date) => (
                        <TableRow key={date}>
                          <TableCell>{formatDate(date)}</TableCell>
                          <TableCell>
                            {selectedSlots[date].map((slot, index) => (
                              <Typography key={index} variant="body2">
                                {slot.startTime} - {slot.endTime}
                              </Typography>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            ))}
          </Stack>
        </Box>

        {/* Date Section */}
        <Box>
          <Typography variant="body2">Total Hours: {getTotalHours}</Typography>
        </Box>

        {/* Billing Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Billing
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">Amount: ${bookingAmount}</Typography>
            <Typography variant="body2">Promo Code: {/* Add promo code input or display */}</Typography>
            <Typography variant="body2">- Discount: $0</Typography>
            <Typography variant="body2">G.Total: ${bookingAmount}</Typography>
          </Stack>
        </Box>

        {/* Notes Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notes
          </Typography>
          <Typography variant="body2">No refunds for cancellations</Typography>
        </Box>
      </Stack>
      <Divider />
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', p: 2 }}></Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end', p: 2 }}>
        <Button onClick={handleClose}>Close</Button>
      </Stack>
    </Dialog>
  );
};

export default BookingPreviewDialog;
