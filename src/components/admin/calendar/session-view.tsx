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
  openRescheduleDialog?: () => void;
  openNotesDialog?: () => void;
  onUpdateStatus?: (id: string, newStatus: BookingSessionEntry['status']) => void;
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
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }
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
                variant="filled" // You can change to "filled" if desired
              />
            </Typography>
            <Typography variant="h6" textAlign={'end'} color="text.secondary" gutterBottom>
              Session Status :
              <Chip
                label={statusDetail?.label} // Show label based on the status
                color={statusDetail?.color} // Set color based on the status
                variant="filled" // You can change to "filled" if desired
              />
            </Typography>
          </Stack>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column', // Applies on small screens and below
                sm: 'row', // Applies on small screens and above
              },
              justifyContent: 'space-between',
              margin: '10px',
            }}
          >
            <>
              {sessionObj && (
                <Card
                  sx={{
                    // height: '140px',

                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  <CardContent sx={{ padding: '10px 15px' }}>
                    <Typography variant="h6" textAlign={'center'} color="text.secondary" gutterBottom>
                      Member :
                    </Typography>
                    <Grid container>
                      <Grid item md={4} xs={12} alignContent={'center'}>
                        <Avatar
                          src={sessionObj.customer?.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} xs={12} alignContent={'center'}>
                        <Typography variant="subtitle1">{sessionObj.customer?.fullName}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                          {sessionObj.customer?.email ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <Envelope width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.customer?.email}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
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
                    // height: '140px',
                    boxShadow: 5, // Normal box shadow
                    '&:hover': {
                      boxShadow: 15, // Increased box shadow on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition effect
                    marginTop: '10px',
                  }}
                >
                  <CardContent sx={{ padding: '10px 15px' }}>
                    <Typography variant="h6" textAlign={'center'} color="text.secondary" gutterBottom>
                      Trainer :
                    </Typography>
                    <Grid container spacing={4}>
                      <Grid item md={4} xs={12} alignContent={'center'}>
                        <Avatar
                          src={sessionObj.trainer?.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>
                      </Grid>
                      <Grid item md={8} xs={12} alignContent={'center'}>
                        <Typography variant="subtitle1">{sessionObj.trainer?.fullName}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
                        >
                          {sessionObj.trainer?.fees ? (
                            <IconButton sx={{ padding: '0px', marginRight: '5px' }}>
                              <CurrencyCircleDollar width={18} height={18} />
                            </IconButton>
                          ) : (
                            ''
                          )}
                          {sessionObj.trainer?.fees} per Hour
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
                        >
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
            <Typography color="text.secondary" textAlign={'center'}>
              {formatDate(sessionObj?.sessionDate)} <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                Session Date
              </Typography>
            </Typography>

            <Typography color="text.secondary" gutterBottom>
              {formatAmount(sessionObj?.netTotalAmount)} <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                Session Amount
              </Typography>
            </Typography>
          </Stack>

          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}>
            <Typography color="text.secondary" gutterBottom>
              {formatTo12HourFormat(sessionObj?.sessionStartTime)} <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                Start
              </Typography>
            </Typography>
            <Typography color="text.secondary" textAlign={'center'}>
              {formatHours(sessionDurationInHours)} <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                (Hours)
              </Typography>
            </Typography>
            <Typography color="text.secondary" textAlign={'center'}>
              {formatTo12HourFormat(sessionObj?.sessionEndTime)} <br />
              <Typography variant="body2" component="span" fontSize={'12px'}>
                End
              </Typography>
            </Typography>
          </Stack>

          <br />

          {sessionObj.notes && <Stack>Notes: {sessionObj.notes}</Stack>}
        </Card>
      </DialogContent>
      <DialogActions sx={{ paddingBottom: '20px' }}>
        <Button
          onClick={onClose}
          color="secondary"
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
        {openRescheduleDialog && (
          <Button
            onClick={openRescheduleDialog}
            className=" btnsuccess"
            sx={{ color: '#fff', fontFamily: 'Audiowide, sans-serif !important' }}
          >
            Reschedule Session
          </Button>
        )}

        {openNotesDialog && (
          <Button
            sx={{ color: '#fff', fontFamily: 'Audiowide, sans-serif !important' }}
            onClick={openNotesDialog}
            className=" btnsuccess"
          >
            Update Notes
          </Button>
        )}

        {onUpdateStatus &&
          sessionObj.status !== BOOKING_STATUS.CANCELED &&
          sessionObj.status !== BOOKING_STATUS.COMPLETED && (
            <Button
              sx={{ fontFamily: 'Audiowide, sans-serif !important' }}
              className="common-button"
              onClick={() => {
                handleStatusChange(String(sessionObj.id), BOOKING_STATUS.CANCELED);
              }}
            >
              Cancel Session
            </Button>
          )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionPreview;
