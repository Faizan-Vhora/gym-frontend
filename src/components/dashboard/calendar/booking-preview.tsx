// BookingPreviewDialog.js
import React from 'react';
import { formatAmount, formatHours } from '@/utils/converter';
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

import { SelectedSlotsI } from './booking-form-dialog';
import { BOOKING_TYPE_DETAILS, WEEKDAY_NAME } from '@/utils/constant';


// Define the props interface
interface BookingPreviewDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedCustomer: { fullName: string } | null;
  selectedTrainer: { fullName: string } | null;
  selectedSlots: SelectedSlotsI;
  bookingType: string;
  bookingAmount: number;
  bookingHours: number;
  netTotalAmount: number;
}

const BookingPreviewDialog: React.FC<BookingPreviewDialogProps> = ({
  isOpen,
  handleClose,
  selectedCustomer,
  selectedTrainer,
  selectedSlots,
  bookingType,
  bookingAmount,
  bookingHours,
  netTotalAmount,
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
            Booking Type : { `${BOOKING_TYPE_DETAILS[bookingType]?.label}`}
          </Typography>

          <Stack spacing={1}>
            {Object.keys(selectedSlots).map((date) => (
              <div key={date}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Weekday</TableCell>
                        <TableCell>Slots</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(selectedSlots).map((weekday: string) => (
                        <TableRow key={weekday}>
                          <TableCell>{`${WEEKDAY_NAME[Number(weekday)]}`}</TableCell>
                          <TableCell>
                            {selectedSlots[weekday].map((slot, index) => (
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
          <Typography variant="body2">Total Hours: { `${formatHours(bookingHours)}` }</Typography>
        </Box>

        {/* Billing Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Billing
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">Amount: {`${formatAmount(bookingAmount)}`} </Typography>
            {/* <Typography variant="body2">Promo Code: </Typography> */}
            <Typography variant="body2"> Discount:  - {`${formatAmount(0)}`} </Typography>
            <Typography variant="subtitle1">G.Total: {`${formatAmount(netTotalAmount)}`} </Typography>
          </Stack>
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
