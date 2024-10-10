// BookingPreviewDialog.js
import React from 'react';
import { BOOKING_TYPE_DETAILS, WEEKDAY_NAME } from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { convertTo12HourFormat, formatDate } from '@/utils/dateUtils';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  // CardHeader,
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

// import { DiscountType } from '../discount/discount-table';
import { BookingDetailsI, SelectedSlotsI, SlotI } from './booking-form-dialog';

// Define the props interface
interface BookingPreviewDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  bookingDetails: BookingDetailsI | null;
}

const BookingPreviewDialog: React.FC<BookingPreviewDialogProps> = ({ isOpen, handleClose, bookingDetails }) => {
  type weekdaySlotI = {
    date: string;
    slots: SlotI[];
  };

  type weeklySlotsPriviewDataI = {
    [key: string]: weekdaySlotI[];
  };

  const [weeklySlotsPriviewData, setWeeklySlotsPriviewData] = React.useState<weeklySlotsPriviewDataI>({});

  const transformSessionsForPriview = (input: SelectedSlotsI): weeklySlotsPriviewDataI => {
    const output: weeklySlotsPriviewDataI = {};

    for (const key in input) {
      const sessions = input[key];
      const groupedByDate: { [date: string]: SlotI[] } = {};

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
    // console.log('()bookingDetails: ', bookingDetails);
    setWeeklySlotsPriviewData(
      bookingDetails?.selectedSlots ? transformSessionsForPriview(bookingDetails.selectedSlots) : {}
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
            {`${bookingDetails?.bookingType && BOOKING_TYPE_DETAILS[bookingDetails.bookingType]?.label}`}
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
                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  {/* <CardHeader title={`Member`}></CardHeader> */}

                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={bookingDetails.selectedCustomer.profileImageUrl}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{bookingDetails.selectedCustomer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedCustomer.email ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Envelope width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {bookingDetails.selectedCustomer.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedCustomer.phoneNumber ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Phone width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {bookingDetails.selectedCustomer.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {bookingDetails?.selectedTrainer && (
                <Card
                  sx={{
                    height: '140px',
                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  {/* <CardHeader title={`Trainer`}></CardHeader> */}

                  <CardContent>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={bookingDetails.selectedTrainer.profileImageUrl}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{bookingDetails.selectedTrainer.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedTrainer.fees ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <CurrencyCircleDollar width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {bookingDetails.selectedTrainer.fees} per Hour
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {bookingDetails.selectedTrainer.experience ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Barbell width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {bookingDetails.selectedTrainer.experience} years
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Stack>

        {/* Booking Type Section */}
        {weeklySlotsPriviewData && (
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
                    {Object.keys(weeklySlotsPriviewData).map((weekday) => (
                      <TableRow key={weekday}>
                        <TableCell>{`${WEEKDAY_NAME[Number(weekday)]}`}</TableCell>
                        <TableCell>
                          {weeklySlotsPriviewData[weekday].map((weekSlot) => (
                            <div key={weekSlot.date}>
                              <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                {`${formatDate(weekSlot.date)}`}
                              </Typography>
                              {weekSlot.slots.map((slot) => (
                                <Typography key={`${weekSlot.date}-${slot.startTime}`} variant="body2">
                                  {`${slot.startTime && convertTo12HourFormat(slot.startTime)}`} -{' '}
                                  {`${slot.endTime && convertTo12HourFormat(slot.endTime)}`}
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
                {`${bookingDetails?.trainerRatePerHour && formatAmount(bookingDetails.trainerRatePerHour)}`}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {`${bookingDetails?.bookingAmount && formatAmount(bookingDetails.bookingAmount)}`}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {`${bookingDetails?.selectedPromocode?.codeName || '-'}`}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {`${bookingDetails?.discountAmount && formatAmount(bookingDetails.discountAmount)}`}

                {/* {bookingDetails?.selectedPromocode &&
                  bookingDetails?.selectedPromocode.discountType == DiscountType.Fix &&
                  `(${formatAmount(bookingDetails?.selectedPromocode?.discountValue)})`}

                {bookingDetails?.selectedPromocode &&
                  bookingDetails?.selectedPromocode.discountType == DiscountType.Percentage &&
                  `(${bookingDetails?.selectedPromocode?.discountValue}%)`} */}
              </Typography>
              <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                {`${bookingDetails?.netTotalAmount && formatAmount(bookingDetails.netTotalAmount)}`}
              </Typography>
            </Stack>
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
