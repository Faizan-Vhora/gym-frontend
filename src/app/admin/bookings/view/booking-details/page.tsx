'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BOOKING_PAYMENT_STATUS_DETAILS,
  BOOKING_PAYMENT_TYPE,
  BOOKING_PAYMENT_TYPE_DETAILS,
  BOOKING_STATUS_DETAILS,
  BOOKING_TYPE_DETAILS,
  GENDER_TYPE_DETAILS,
} from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { formatDate } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { Avatar, Box, Card, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Barbell, Envelope, GenderIntersex, MapPin, Phone } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { BookingEntry } from '@/components/admin/booking/booking-table';

export default function BookingDetailsPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [bookingDetail, setBookingDetails] = React.useState<BookingEntry | null>(null);

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (bookingId) {
      getBookingDetails();
    }
  }, [bookingId]);

  const getBookingDetails = () => {
    setLoading(true);
    axiosInstance
      .get<{ data: BookingEntry }>(`/session-booking/${bookingId}`)
      .then((response) => {
        const fetchedData: BookingEntry = response.data.data;
        // console.log('fetchedData: ', fetchedData);
        setBookingDetails(fetchedData);
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    // <>
    // Booking Details for ID:  {bookingId}
    // </>

    <Box>
      {bookingDetail && (
        <Card sx={{ padding: '20px 10px' }}>
          {/* <CardContent> */}

          <Grid container rowGap={6} columnGap={6} justifyContent={'center'} sx={{ padding: '20px 10px' }}>
            {/*  Booking Details */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="h6"
                component="div"
                style={{ fontFamily: '"Audiowide", sans-serif' }}
                color="black"
                marginBottom={'10px'}
              >
                Booking
              </Typography>
              <Card className="bookin-card">
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: '#dcdfe4',
                  }}
                >
                  <Typography
                    variant="h6"
                    textAlign={'end'}
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {BOOKING_TYPE_DETAILS[bookingDetail.bookingType]?.label}
                  </Typography>
                  <Typography
                    textAlign={'end'}
                    component="span"
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {BOOKING_STATUS_DETAILS[bookingDetail.status]?.label}
                  </Typography>
                </Stack>

                <Stack
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}
                >
                  <Typography color="text.secondary" style={{ fontFamily: '"Audiowide", sans-serif' }} gutterBottom>
                    {formatDate(bookingDetail?.startDate)} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      Start
                    </Typography>
                  </Typography>
                  <Typography
                    color="text.secondary"
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    textAlign={'center'}
                  >
                    {formatHours(bookingDetail?.bookingHours)} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      (Hours)
                    </Typography>
                  </Typography>
                  <Typography
                    color="text.secondary"
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    textAlign={'center'}
                  >
                    {formatDate(bookingDetail?.endDate)} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      End
                    </Typography>
                  </Typography>
                </Stack>

                <Stack
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}
                >
                  <Typography color="text.secondary" style={{ fontFamily: '"Audiowide", sans-serif' }} gutterBottom>
                    {bookingDetail?.createdBy?.fullName} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      Booking By
                    </Typography>
                  </Typography>
                  <Typography
                    color="text.secondary"
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    textAlign={'center'}
                  >
                    {bookingDetail?.recurrenceWeeks} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      (Recurrence Weeks)
                    </Typography>
                  </Typography>
                  <Typography
                    color="text.secondary"
                    style={{ fontFamily: '"Audiowide", sans-serif' }}
                    textAlign={'center'}
                  >
                    {dayjs(bookingDetail?.createdAt).format('DD/MM/YYYY')} <br />
                    <Typography variant="body2" component="span" fontSize={'12px'}>
                      Booking at
                    </Typography>
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {/*  Payment Details */}

              <Typography
                variant="h6"
                component="div"
                color="black"
                style={{ fontFamily: '"Audiowide", sans-serif' }}
                marginBottom={'10px'}
              >
                Payment Details
              </Typography>
              <Card className="bookin-card">
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
                    <Typography
                      textAlign={'end'}
                      fontWeight={'600'}
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                      color="text.secondary"
                      gutterBottom
                    >
                      {BOOKING_PAYMENT_TYPE_DETAILS[bookingDetail.paymentType]?.label}
                    </Typography>
                  </Typography>

                  {bookingDetail?.paymentType === BOOKING_PAYMENT_TYPE.FULL && (
                    <Typography
                      textAlign={'end'}
                      color="text.secondary"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                      gutterBottom
                    >
                      {BOOKING_PAYMENT_STATUS_DETAILS[bookingDetail.paymentStatus]?.label}
                    </Typography>
                  )}
                </Stack>
                <Stack
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '20px' }}
                >
                  <Stack rowGap={1}>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Booking Hours :
                    </Typography>

                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Trainer Rate Per Hour :
                    </Typography>
                    {/* <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Payment Type:
                    </Typography> */}
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Booking Amount :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Discount :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Total Amount :
                    </Typography>
                    {/* <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Payment Status:
                    </Typography> */}
                  </Stack>
                  <Stack rowGap={1}>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatHours(bookingDetail?.bookingHours)}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatAmount(bookingDetail?.trainerRatePerHour)}
                    </Typography>
                    {/* <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {BOOKING_PAYMENT_TYPE_DETAILS[bookingDetail.paymentType]?.label}
                    </Typography> */}
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatAmount(bookingDetail?.bookingAmount)}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatAmount(bookingDetail?.discount)}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatAmount(bookingDetail?.netTotalAmount)}
                    </Typography>
                    {/* <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {BOOKING_PAYMENT_STATUS_DETAILS[bookingDetail.paymentStatus]?.label}
                    </Typography> */}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              {/* Member Details */}
              <Typography
                variant="h6"
                component="div"
                style={{ fontFamily: '"Audiowide", sans-serif' }}
                color="black"
                marginBottom={'10px'}
              >
                Member Details
              </Typography>
              <Card className="bookin-card">
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
                    {bookingDetail?.customer?.memberId}
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
                  <Avatar sx={{ height: '76px', width: '76px' }}></Avatar>

                  <Stack>
                    <Typography
                      color="text.secondary"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                      fontWeight={'600'}
                      gutterBottom
                    >
                      {bookingDetail?.customer?.fullName}
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
                        {bookingDetail?.customer?.email}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        {' '}
                        <Phone size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.customer?.phoneNumber}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        <GenderIntersex size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.customer?.gender && GENDER_TYPE_DETAILS[bookingDetail?.customer?.gender]?.label}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        <MapPin size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.customer?.address}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Add other fields as necessary */}
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {/* Trainer Details */}
              <Typography
                variant="h6"
                component="div"
                style={{ fontFamily: '"Audiowide", sans-serif' }}
                color="black"
                marginBottom={'10px'}
              >
                Trainer Details
              </Typography>
              <Card className="bookin-card">
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
                    {bookingDetail?.trainer?.memberId}
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
                    <Avatar sx={{ height: '76px', width: '76px' }}></Avatar>
                    <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                      <IconButton>
                        <Barbell size={18} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.trainer?.experience} years
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack>
                    <Typography
                      color="text.secondary"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                      fontWeight={'600'}
                      gutterBottom
                    >
                      {bookingDetail?.trainer?.fullName}
                    </Typography>

                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        <Envelope size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.trainer?.email}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        {' '}
                        <Phone size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.trainer?.phoneNumber}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        <GenderIntersex size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.trainer?.gender && GENDER_TYPE_DETAILS[bookingDetail?.trainer?.gender]?.label}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <IconButton>
                        <MapPin size={25} />
                      </IconButton>
                      <Typography color="text.secondary" gutterBottom>
                        {bookingDetail?.trainer?.address}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
      )}

      {loading && <CustomLoader />}

      <ToastContainer />
    </Box>
  );
}
