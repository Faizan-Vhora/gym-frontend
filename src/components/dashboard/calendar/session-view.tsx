import React from 'react';
import {
  BOOKING_SESSION_PAYMENT_STATUS_DETAILS,
  BOOKING_SESSION_STATUS_DETAILS,
  BOOKING_STATUS,
} from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Barbell, CurrencyCircleDollar, Envelope, Phone } from '@phosphor-icons/react';

import { BookingSessionEntry } from '../booking/view/booking-sessions/booking-session-table';

interface SessionNotesFormProps {
  sessionObj: BookingSessionEntry;
  open: boolean;
  onClose: () => void;
  openRescheduleDialog: () => void;
  openNotesDialog: () => void;
  onUpdateStatus: (id: string, newStatus: BookingSessionEntry['status']) => void;
}

const SessionPreview: React.FC<SessionNotesFormProps> = ({
  sessionObj,
  open,
  onClose,
  openRescheduleDialog,
  openNotesDialog,
  onUpdateStatus,
}) => {
  const statusDetail = BOOKING_SESSION_STATUS_DETAILS[sessionObj.status];

  const PaymentStatus = BOOKING_SESSION_PAYMENT_STATUS_DETAILS[sessionObj.paymentStatus];

  const handleStatusChange = (id: string, newStatus: BookingSessionEntry['status']): void => {
    onUpdateStatus(id, newStatus);
  };

  const sessionDurationInHours =
    (new Date(`1970-01-01T${sessionObj.sessionEndTime}Z`).getTime() -
      new Date(`1970-01-01T${sessionObj.sessionStartTime}Z`).getTime()) /
    (1000 * 60 * 60); // Calculate duration in hours

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 999 }}>
      {/* <DialogTitle>Session Details</DialogTitle> */}
      <DialogContent>
        <Typography variant="h6" component="div" color="black" marginBottom={'10px'}>
          Session Preview
        </Typography>
        <Card sx={{ padding: 2 }} className="session-card">
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: '#dcdfe4',
            }}
          >
            <Typography variant="h6" textAlign={'end'} color="text.secondary" gutterBottom>
              Payment Status :
              <Chip
                label={PaymentStatus?.label} // Show label based on the status
                color={PaymentStatus?.color} // Set color based on the status
                variant="outlined" // You can change to "filled" if desired
              />
            </Typography>
            <Typography variant="h6" textAlign={'end'} color="text.secondary" gutterBottom>
              Session Status :
              <Chip
                label={statusDetail?.label} // Show label based on the status
                color={statusDetail?.color} // Set color based on the status
                variant="outlined" // You can change to "filled" if desired
              />
            </Typography>
          </Stack>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: '#dcdfe4',
              margin: '10px',
            }}
          >
            <>
              {sessionObj && (
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
                  <CardContent>
                    <Typography variant="h6" textAlign={'center'} color="text.secondary" gutterBottom>
                      Member :
                    </Typography>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={sessionObj.customer?.profileImageUrl}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{sessionObj.customer?.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {sessionObj.customer?.email ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Envelope width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.customer?.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {sessionObj.customer?.phoneNumber ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Phone width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.customer?.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}

              {sessionObj && (
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
                  <CardContent>
                    <Typography variant="h6" textAlign={'center'} color="text.secondary" gutterBottom>
                      Trainer :
                    </Typography>
                    <Grid container>
                      <Grid item md={4} alignContent={'center'}>
                        <Avatar
                          src={sessionObj.trainer?.profileImageUrl}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} alignContent={'center'}>
                        <Typography variant="subtitle1">{sessionObj.trainer?.fullName}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {sessionObj.trainer?.fees ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <CurrencyCircleDollar width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.trainer?.fees} per Hour
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          {sessionObj.trainer?.experience ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Barbell width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.trainer?.experience} years
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Add other fields as necessary */}
                  </CardContent>
                </Card>
              )}
            </>
          </Stack>
          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}>
            <Typography color="text.secondary" gutterBottom>
              Start <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                {formatTo12HourFormat(sessionObj?.sessionStartTime)}
              </Typography>
            </Typography>
            <Typography color="text.secondary" textAlign={'center'}>
              Hours <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                ({formatHours(sessionDurationInHours)})
              </Typography>
            </Typography>
            <Typography color="text.secondary" textAlign={'center'}>
              End <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                {formatTo12HourFormat(sessionObj?.sessionEndTime)}
              </Typography>
            </Typography>
          </Stack>

          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}>
            <Typography color="text.secondary" gutterBottom>
              Session Amount <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                {formatAmount(sessionObj?.netTotalAmount)}
              </Typography>
            </Typography>

            <Typography color="text.secondary" textAlign={'center'}>
              Booking at <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                {formatDate(sessionObj?.sessionDate)}
              </Typography>
            </Typography>
          </Stack>
          <br />
          <Stack>Notes: {sessionObj.notes}</Stack>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button color="primary" onClick={openRescheduleDialog}>
          Reschedule Session
        </Button>
        <Button color="primary" onClick={openNotesDialog}>
          Update Notes
        </Button>
        <Button
          color="primary"
          onClick={() => {
            handleStatusChange(String(sessionObj.id), BOOKING_STATUS.CANCELED);
          }}
        >
          Cancel Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionPreview;
