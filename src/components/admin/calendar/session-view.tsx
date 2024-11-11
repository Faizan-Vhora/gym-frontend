import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BOOKING_SESSION_PAYMENT_STATUS_DETAILS,
  BOOKING_SESSION_STATUS_DETAILS,
  BOOKING_STATUS,
  GENDER_TYPE_DETAILS,
} from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Barbell, CurrencyDollar, Envelope, GenderIntersex, MapPin, Phone } from '@phosphor-icons/react';

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
  const router = useRouter();
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
                sx={{ marginLeft: '10px' }}
                label={PaymentStatus?.label} // Show label based on the status
                color={PaymentStatus?.color} // Set color based on the status
                variant="filled" // You can change to "filled" if desired
              />
            </Typography>
            <Typography variant="h6" textAlign={'end'} color="text.secondary" gutterBottom>
              Session Status :
              <Chip
                sx={{ marginLeft: '10px' }}
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
              // justifyContent: 'space-between',
              margin: '10px',
            }}
          >
            <>
              <Grid container columnGap={5} justifyContent={'space-evenly'}>
                <Grid item sm={5} xs={12} alignContent={'center'}>
                  {sessionObj && (
                    <Card
                      className="bookin-card"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        router.push(`/admin/customers/form?id=${sessionObj?.customer?.id}&tab=1`);
                      }}
                    >
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid',
                          borderColor: '#dcdfe4',
                          marginBottom: '30px',
                        }}
                      >
                        <Typography
                          color="text.secondary"
                          style={{ fontFamily: '"Audiowide", sans-serif' }}
                          fontWeight={'600'}
                          gutterBottom
                        >
                          Member Id :
                        </Typography>
                        <Typography
                          textAlign={'end'}
                          style={{ fontFamily: '"Audiowide", sans-serif' }}
                          color="text.secondary"
                          gutterBottom
                        >
                          {sessionObj?.customer?.memberId}
                        </Typography>
                      </Stack>

                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: {
                            xs: 'column', // Column direction for mobile screens
                            md: 'row', // Row direction for larger screens like tablets and above
                          },
                          alignItems: 'start',
                          columnGap: '20px',
                        }}
                      >
                        <Avatar
                          src={sessionObj.customer?.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        ></Avatar>

                        <Stack>
                          <Typography
                            color="text.secondary"
                            style={{ fontFamily: '"Audiowide", sans-serif' }}
                            fontWeight={'300'}
                            gutterBottom
                          >
                            {sessionObj?.customer?.fullName}
                          </Typography>

                          <Stack flexDirection={'row'} alignItems={'center'}>
                            <IconButton>
                              <Envelope size={25} />
                            </IconButton>

                            <Typography
                              color="text.secondary"
                              gutterBottom
                              sx={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                              }}
                            >
                              {sessionObj?.customer?.email}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.customer?.phoneNumber && (
                              <IconButton>
                                <Phone size={25} />
                              </IconButton>
                            )}

                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.customer?.phoneNumber}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.customer?.gender && (
                              <IconButton>
                                <GenderIntersex size={25} />
                              </IconButton>
                            )}

                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.customer?.gender && GENDER_TYPE_DETAILS[sessionObj?.customer?.gender]?.label}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.customer?.address && (
                              <IconButton>
                                <MapPin size={25} />
                              </IconButton>
                            )}

                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.customer?.address}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      {/* Add other fields as necessary */}
                    </Card>
                  )}
                </Grid>
                <Grid item sm={5} xs={12} alignContent={'center'}>
                  {sessionObj && (
                    <Card
                      className="bookin-card"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        router.push(`/admin/trainers/form?id=${sessionObj?.trainer?.id}&tab=1`);
                      }}
                    >
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid',
                          borderColor: '#dcdfe4',
                          marginBottom: '30px',
                        }}
                      >
                        <Typography
                          color="text.secondary"
                          style={{ fontFamily: '"Audiowide", sans-serif' }}
                          fontWeight={'600'}
                          gutterBottom
                        >
                          Trainer Id :
                        </Typography>
                        <Typography
                          textAlign={'end'}
                          style={{ fontFamily: '"Audiowide", sans-serif' }}
                          color="text.secondary"
                          gutterBottom
                        >
                          {sessionObj?.trainer?.memberId}
                        </Typography>
                      </Stack>

                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: {
                            xs: 'column', // Column direction for mobile screens
                            md: 'row', // Row direction for larger screens like tablets and above
                          },
                          alignItems: 'start',
                          columnGap: '20px',
                        }}
                      >
                        <Stack>
                          <Avatar
                            src={sessionObj.trainer?.profileImageUrl || '/assets/User@3x-1.png'}
                            sx={{ height: '56px', width: '56px' }}
                          ></Avatar>
                          <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                            <IconButton>
                              <Barbell size={18} />
                            </IconButton>
                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.trainer?.experience} years
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack>
                          <Typography
                            color="text.secondary"
                            style={{ fontFamily: '"Audiowide", sans-serif' }}
                            fontWeight={'300'}
                            gutterBottom
                          >
                            {sessionObj?.trainer?.fullName}
                          </Typography>

                          <Stack flexDirection={'row'} alignItems={'center'}>
                            <IconButton>
                              <Envelope size={25} />
                            </IconButton>
                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.trainer?.email}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.trainer?.phoneNumber && (
                              <IconButton>
                                <Phone size={25} />
                              </IconButton>
                            )}
                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.trainer?.phoneNumber}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.trainer?.gender && (
                              <IconButton>
                                <GenderIntersex size={25} />
                              </IconButton>
                            )}
                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.trainer?.gender && GENDER_TYPE_DETAILS[sessionObj?.trainer?.gender]?.label}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.trainer?.address && (
                              <IconButton>
                                <MapPin size={25} />
                              </IconButton>
                            )}
                            <Typography color="text.secondary" gutterBottom>
                              {sessionObj?.trainer?.address}
                            </Typography>
                          </Stack>
                          <Stack flexDirection={'row'} alignItems={'center'}>
                            {sessionObj?.trainer?.fees && (
                              <>
                                <IconButton>
                                  <CurrencyDollar size={20} />
                                </IconButton>
                                <Typography color="text.secondary" gutterBottom>
                                  {sessionObj?.trainer?.fees}
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  )}
                </Grid>
              </Grid>
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
            marginRight: '10px',
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
              sx={{ fontFamily: 'Audiowide, sans-serif !important', margin: '10px' }}
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
