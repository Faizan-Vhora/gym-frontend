'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BOOKING_PAYMENT_STATUS_DETAILS,
  BOOKING_PAYMENT_TYPE_DETAILS,
  BOOKING_STATUS_DETAILS,
  BOOKING_TYPE_DETAILS,
} from '@/utils/constant';
import { formatDate, formatUtcToLocalDatetime } from '@/utils/dateUtils';
import { CustomLoader } from '@/utils/loader';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { height, padding, width } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { BookingEntry } from '@/components/dashboard/booking/booking-table';

export default function BookingDetailsPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const booingId = searchParams.get('id');

  const [bookingDetail, setBookingDetails] = React.useState<BookingEntry | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (booingId) {
      getBookingDetails();
    }
  }, [booingId]);

  const getBookingDetails = () => {
    setLoading(true);
    axiosInstance
      .get<{ data: BookingEntry }>(`/session-booking/${booingId}`)
      .then((response) => {
        const fetchedData: BookingEntry = response.data.data;
        console.log('fetchedData: ', fetchedData);
        setBookingDetails(fetchedData);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  return (
    // <>
    // Booking Details for ID:  {booingId}
    // </>

    <Box>
      {bookingDetail && (
        <Card sx={{ padding: '20px 10px' }}>
          {/* <CardContent> */}

          <Grid container rowGap={6} columnGap={6} justifyContent={'center'} sx={{ padding: '20px 10px' }}>
            {/*  Booking Details */}
            <Grid item xs={12}  sm={6} md={4}>
              <Typography variant="h6" component="div" color="black" marginBottom={'10px'}>
                Booking
              </Typography>
              <Card sx={{ height: 340, padding: 2 }} className="bookin-card">
              <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',borderBottom:'1px solid',borderColor:'#dcdfe4' }}>
              <Typography variant="h6" textAlign={'end'} color="text.secondary" gutterBottom>
                      {/* {BOOKING_TYPE_DETAILS[bookingDetail.bookingType].label} */}
                      Weekly
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {BOOKING_STATUS_DETAILS[bookingDetail.status].label}
                    </Typography>
              </Stack>
               <Stack
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}
                >
                  <Typography color="text.secondary"  gutterBottom>
                    Start <br /> {formatDate(bookingDetail?.startDate)}
                  </Typography>
                    <Typography color="text.secondary" textAlign={'center'}>
                      Hours <br /> ({bookingDetail?.bookingHours} Hrs){' '}
                    </Typography>

                    <Typography color="text.secondary" textAlign={'center'}>
                      End <br /> {formatDate(bookingDetail?.endDate)}
                    </Typography>
                  
                </Stack>
                <Stack >
                  <Stack rowGap={2} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '30px' }}>
                    <Typography color="text.secondary" fontWeight={'600'} >
                      Booking By <br /> maaz
                    </Typography>

                    <Typography color="text.secondary" fontWeight={'600'} >
                      Booking at: <br /> 10/08/2024
                    </Typography>
                  </Stack>
                  {/* <Stack rowGap={2}>
    
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {formatUtcToLocalDatetime(bookingDetail?.createdAt)}
                    </Typography>

      
                  </Stack> */}
                </Stack>


                {/* <Typography color="text.secondary" gutterBottom>
            Booking Type: { BOOKING_TYPE_DETAILS[bookingDetail.bookingType].label }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Booking at: { formatUtcToLocalDatetime(bookingDetail?.createdAt) }
          </Typography> */}

                {/* <Typography color="text.secondary" gutterBottom>
            Duration: from { formatDate(bookingDetail?.startDate) } to { formatDate(bookingDetail?.endDate)}
            ({ bookingDetail?.bookingHours } Hrs)
          </Typography>


          <Typography color="text.secondary" gutterBottom>
            Week Days : { bookingDetail?.weekdays }
          </Typography> */}

                {bookingDetail?.recurrenceWeeks ? (
                  <Typography color="text.secondary" gutterBottom>
                    Recurrence Weeks: {bookingDetail?.recurrenceWeeks}
                  </Typography>
                ) : (
                  <></>
                )}

                {/* <Typography color="text.secondary" gutterBottom>
            Booking Status: { BOOKING_STATUS_DETAILS[bookingDetail.status].label }
          </Typography> */}
              </Card>
            </Grid>
            <Grid item xs={12}  sm={6} md={4}>
              {/*  Payment Details */}

              <Typography variant="h6" component="div" color="black" marginBottom={'10px'}>
                Payment Details
              </Typography>

              <Card sx={{ height: 340, padding: 2 }} className="bookin-card">
                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Stack rowGap={2}>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Booking Hours :
                    </Typography>

                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Trainer Rate Per Hour :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Payment Type:
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Booking Amount :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Discount :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Total Amount :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Payment Status:
                    </Typography>
                  </Stack>
                  <Stack rowGap={2}>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.bookingHours}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      ${bookingDetail?.trainerRatePerHour}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {BOOKING_PAYMENT_TYPE_DETAILS[bookingDetail.paymentType].label}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      ${bookingDetail?.bookingAmount}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      ${bookingDetail?.discount}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      ${bookingDetail?.netTotalAmount}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {BOOKING_PAYMENT_STATUS_DETAILS[bookingDetail.paymentStatus].label}
                    </Typography>
                  </Stack>
                </Stack>

                {/* <Typography color="text.secondary" gutterBottom>
                  Booking Hours : {bookingDetail?.bookingHours}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Trainer Rate Per Hour : ${bookingDetail?.trainerRatePerHour}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Payment Type: {BOOKING_PAYMENT_TYPE_DETAILS[bookingDetail.paymentType].label}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Booking Amount : ${bookingDetail?.bookingAmount}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Discount : ${bookingDetail?.discount}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Total Amount : ${bookingDetail?.netTotalAmount}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Payment Status: {BOOKING_PAYMENT_STATUS_DETAILS[bookingDetail.paymentStatus].label}
                </Typography> */}
              </Card>
            </Grid>
            
            <Grid item xs={12}  sm={6} md={4}>
              {/* Member Details */}
              <Typography variant="h6" component="div" color="black" marginBottom={'10px'}>
                Member Details
              </Typography>
              <Card sx={{ height: 340, padding: 2 }} className="bookin-card">
                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Stack rowGap={2}>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Member Id :
                    </Typography>

                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Full Name :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Email :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Phone Number :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Gender :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      address :
                    </Typography>
                  </Stack>
                  <Stack rowGap={2}>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.memberId}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.fullName}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.email}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.phoneNumber}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.gender}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.customer?.address}
                    </Typography>
                  </Stack>
                </Stack>

                {/* <Typography color="text.secondary" gutterBottom>
           Member Id  : { bookingDetail?.customer?.memberId }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Full Name  : { bookingDetail?.customer?.fullName }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Email  : { bookingDetail?.customer?.email }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Phone Number  : { bookingDetail?.customer?.phoneNumber }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
          Gender  : { bookingDetail?.customer?.gender }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
           address  : { bookingDetail?.customer?.address }
          </Typography> */}
              </Card>
            </Grid>
            <Grid item xs={12}  sm={6} md={4}>
              {/* Trainer Details */}
              <Typography variant="h6" component="div" color="black" marginBottom={'10px'}>
                Trainer Details
              </Typography>
              <Card sx={{ height: 340, padding: 2 }} className="bookin-card">
                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Stack rowGap={2}>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Trainer Id :
                    </Typography>

                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Full Name :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Email :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Phone Number :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Gender :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      Experience :
                    </Typography>
                    <Typography color="text.secondary" fontWeight={'600'} gutterBottom>
                      address :
                    </Typography>
                  </Stack>
                  <Stack rowGap={2}>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.memberId}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.fullName}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.email}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.phoneNumber}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.gender}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.experience}
                    </Typography>
                    <Typography textAlign={'end'} color="text.secondary" gutterBottom>
                      {bookingDetail?.trainer?.address}
                    </Typography>
                  </Stack>
                </Stack>

                {/* <Typography color="text.secondary" gutterBottom>
                  Trainer Id : {bookingDetail?.trainer?.memberId}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Full Name : {bookingDetail?.trainer?.fullName}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Email : {bookingDetail?.trainer?.email}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Phone Number : {bookingDetail?.trainer?.phoneNumber}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Gender : {bookingDetail?.trainer?.gender}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  Experience : {bookingDetail?.trainer?.experience} Years
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  address : {bookingDetail?.trainer?.address}
                </Typography> */}
              </Card>
              
            </Grid>


          </Grid>

          {/* </CardContent> */}
        </Card>
      )}

      {loading && <CustomLoader />}
      {error ? <Alert color="error">{error}</Alert> : null}

      <ToastContainer />
    </Box>
  );
}
