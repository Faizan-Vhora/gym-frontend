'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Alert, Box, Card, CardContent, CardHeader, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import axiosInstance from '@/lib/axios';
import { BookingEntry } from '@/components/dashboard/booking/booking-table';
import { toast, ToastContainer } from 'react-toastify';
import { formatDate, formatUtcToLocalDatetime } from '@/utils/dateUtils';
import { BOOKING_PAYMENT_STATUS_DETAILS, BOOKING_PAYMENT_TYPE_DETAILS, BOOKING_STATUS_DETAILS, BOOKING_TYPE_DETAILS } from '@/utils/constant';

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
        console.log("fetchedData: ",fetchedData)
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

    <Box >

    {
      bookingDetail &&

      (

      <Card>

        <CardContent>

          {/*  Booking Details */}

          <Typography variant="h6" component="div" color="black">
            Booking
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Booking Type: { BOOKING_TYPE_DETAILS[bookingDetail.bookingType].label }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Booking at: { formatUtcToLocalDatetime(bookingDetail?.createdAt) }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Duration: from { formatDate(bookingDetail?.startDate) } to { formatDate(bookingDetail?.endDate)}
            ({ bookingDetail?.bookingHours } Hrs)
          </Typography>


          <Typography color="text.secondary" gutterBottom>
            Week Days : { bookingDetail?.weekdays }
          </Typography>

          {
            bookingDetail?.recurrenceWeeks ?  (
              <Typography color="text.secondary" gutterBottom>
              Recurrence Weeks:  { bookingDetail?.recurrenceWeeks }
             </Typography>
            ) : <></>

          }

          <Typography color="text.secondary" gutterBottom>
            Booking Status: { BOOKING_STATUS_DETAILS[bookingDetail.status].label }
          </Typography>


          {/* Member Details */}
          <Typography variant="h6" component="div" color="black">
            Member Details
          </Typography>


          <Typography color="text.secondary" gutterBottom>
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
          </Typography>




          {/* Trainer Details */}
          <Typography variant="h6" component="div" color="black">
          Trainer Details
          </Typography>


          <Typography color="text.secondary" gutterBottom>
          Trainer Id  : { bookingDetail?.trainer?.memberId }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Full Name  : { bookingDetail?.trainer?.fullName }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Email  : { bookingDetail?.trainer?.email }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Phone Number  : { bookingDetail?.trainer?.phoneNumber }
          </Typography>


          <Typography color="text.secondary" gutterBottom>
          Gender  : { bookingDetail?.trainer?.gender }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
          Experience  : { bookingDetail?.trainer?.experience } Years
          </Typography>

          <Typography color="text.secondary" gutterBottom>
           address  : { bookingDetail?.trainer?.address }
          </Typography>


            {/*  Payment Details */}
          <Typography variant="h6" component="div" color="black">
            Payment Details
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Booking Hours  : { bookingDetail?.bookingHours }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
          Trainer Rate Per Hour  : ${ bookingDetail?.trainerRatePerHour }
          </Typography>



          <Typography color="text.secondary" gutterBottom>
          Payment Type: { BOOKING_PAYMENT_TYPE_DETAILS[bookingDetail.paymentType].label }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
            Booking Amount  : ${ bookingDetail?.bookingAmount }
          </Typography>

          <Typography color="text.secondary" gutterBottom>
          Discount  : ${ bookingDetail?.discount }
          </Typography>


          <Typography color="text.secondary" gutterBottom>
          Total Amount  : ${ bookingDetail?.netTotalAmount }
          </Typography>


          <Typography color="text.secondary" gutterBottom>
          Payment Status: { BOOKING_PAYMENT_STATUS_DETAILS[bookingDetail.paymentStatus].label }
          </Typography>

        </CardContent>

      </Card>

      )
    }



    {loading && <CustomLoader />}
    {error ? <Alert color="error">{error}</Alert> : null}

    <ToastContainer />
  </Box>



  );


}
