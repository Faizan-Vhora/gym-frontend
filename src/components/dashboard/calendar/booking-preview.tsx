import React from 'react';
import { BOOKING_TYPE_DETAILS, WEEKDAY_NAME } from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Divider,
  Grid,
  IconButton,
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
import { Barbell, CurrencyCircleDollar, Envelope, Phone } from '@phosphor-icons/react';

import { BookingPreviewDialogProps, SelectedSlotsI, SlotI } from './types';

// Define the props interface

interface WeekdaySlot {
  date: string;
  slots: SlotI[];
}

interface WeeklySlotsPreviewData extends Record<string, WeekdaySlot[]> {}

const BookingPreviewDialog: React.FC<BookingPreviewDialogProps> = ({ isOpen, handleClose, bookingDetails }) => {
  const [weeklySlotsPreviewData, setWeeklySlotsPreviewData] = React.useState<WeeklySlotsPreviewData>({});

  const transformSessionsForPreview = (input: SelectedSlotsI): WeeklySlotsPreviewData => {
    const output: WeeklySlotsPreviewData = {};

    for (const key in input) {
      const sessions = input[key];
      const groupedByDate: Record<string, SlotI[]> = {};

      sessions.forEach((session) => {
        if (session) {
          const { date } = session;

          if (date) {
            if (!groupedByDate[date]) {
              groupedByDate[date] = [];
            }
            groupedByDate[date].push(session);
          }
        }
      });

      output[key] = Object.keys(groupedByDate).map((date) => ({
        date,
        slots: groupedByDate[date],
      }));
    }

    return output;
  };

  React.useEffect(() => {
    setWeeklySlotsPreviewData(
      bookingDetails?.selectedSlots ? transformSessionsForPreview(bookingDetails.selectedSlots) : {}
    );
  }, [bookingDetails]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={isOpen}>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: 'center' }} variant="h5">
          Booking Preview
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}>
          <Typography variant="body2" gutterBottom>
            {bookingDetails?.bookingType && BOOKING_TYPE_DETAILS[bookingDetails.bookingType]?.label}
            <br />
            <Typography fontSize={'12px'} component="span">
              Booking Type
            </Typography>
          </Typography>

          <Typography gutterBottom>
            {bookingDetails?.bookingStartDate && formatDate(bookingDetails?.bookingStartDate)}
            <br />
            <Typography fontSize={'12px'} component="span">
              Start On
            </Typography>
          </Typography>

          <Typography textAlign={'center'}>
            {bookingDetails?.bookingHours && formatHours(bookingDetails?.bookingHours)}
            <br />
            <Typography fontSize={'12px'} component="span">
              Hours
            </Typography>
          </Typography>

          <Typography textAlign={'center'}>
            {bookingDetails?.bookingEndDate && formatDate(bookingDetails?.bookingEndDate)}
            <br />
            <Typography fontSize={'12px'} component="span">
              End On
            </Typography>
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ p: 0 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              {bookingDetails?.selectedCustomer && (
                <Card
                  sx={{
                    height: '140px',
                    boxShadow: 5,
                    '&:hover': {
                      boxShadow: 15,
                    },
                    transition: 'box-shadow 0.3s ease-in-out',
                    marginTop: '10px',
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={bookingDetails.selectedCustomer.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        />
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{bookingDetails.selectedCustomer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedCustomer.email && (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Envelope width={18} height={18} />
                            </IconButton>
                          )}
                          {bookingDetails.selectedCustomer.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedCustomer.phoneNumber && (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Phone width={18} height={18} />
                            </IconButton>
                          )}
                          {bookingDetails.selectedCustomer.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {bookingDetails?.selectedTrainer && (
                <Card
                  sx={{
                    height: '140px',
                    boxShadow: 5,
                    '&:hover': {
                      boxShadow: 15,
                    },
                    transition: 'box-shadow 0.3s ease-in-out',
                    marginTop: '10px',
                  }}
                >
                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={bookingDetails?.selectedTrainer?.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        />
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{bookingDetails.selectedTrainer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedTrainer.fees && (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <CurrencyCircleDollar width={18} height={18} />
                            </IconButton>
                          )}
                          {bookingDetails.selectedTrainer.fees} per Hour
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedTrainer.experience && (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Barbell width={18} height={18} />
                            </IconButton>
                          )}
                          {bookingDetails.selectedTrainer.experience} years
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Stack>

        {/* Booking Type Section */}
        {weeklySlotsPreviewData && (
          <Box>
            <Stack spacing={1}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Weekday</TableCell>
                      <TableCell>Slots</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(weeklySlotsPreviewData).map((weekday) => (
                      <TableRow key={weekday}>
                        <TableCell>{WEEKDAY_NAME[Number(weekday)]}</TableCell>
                        <TableCell>
                          {weeklySlotsPreviewData[weekday].map((weekSlot) => (
                            <div key={weekSlot.date}>
                              <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                {formatDate(weekSlot.date)}
                              </Typography>
                              {weekSlot.slots.map((slot) => (
                                <Typography key={`${weekSlot.date}-${slot.startTime}`} variant="body2">
                                  {slot.startTime && formatTo12HourFormat(slot.startTime)} -{' '}
                                  {slot.endTime && formatTo12HourFormat(slot.endTime)}
                                </Typography>
                              ))}
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Box>
        )}

        {/* Billing Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Billing
          </Typography>
          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '20px' }}>
            <Stack rowGap={1}>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Booking Hours:
              </Typography>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Trainer Rate Per Hour:
              </Typography>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Booking Amount:
              </Typography>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Promocode:
              </Typography>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Discount:
              </Typography>
              <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                Total Amount:
              </Typography>
            </Stack>
            <Stack rowGap={1}>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {formatHours(bookingDetails?.bookingHours)}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {bookingDetails?.trainerRatePerHour && formatAmount(bookingDetails.trainerRatePerHour)}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {bookingDetails?.bookingAmount && formatAmount(bookingDetails.bookingAmount)}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {bookingDetails?.selectedPromocode?.codeName || '-'}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {bookingDetails?.discountAmount && formatAmount(bookingDetails.discountAmount)}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {bookingDetails?.netTotalAmount && formatAmount(bookingDetails.netTotalAmount)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Divider />
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', p: 2 }}></Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end', p: 2 }}>
        <Button onClick={handleClose} className="common-button">
          Close
        </Button>
      </Stack>
    </Dialog>
  );
};

export default BookingPreviewDialog;
