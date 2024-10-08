'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Alert, Box, Card, CardHeader, Divider, Stack, Tab, Tabs } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import BookingSessionsPage from './booking-sessions/page';
import BookingDetailsPage from './booking-details/page';

export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [tab, setTab] = React.useState(0); // State to control the active tab

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Card>
        <CardHeader title={`View Booking | ${id}`} />
        {id && (
          <Stack sx={{ marginLeft: '20px' }}>
            <Divider />
            <Tabs value={tab} onChange={handleTabChange} aria-label="booking details tabs">
              <Tab label="Booking Details" />
              <Tab label="Booking Sessions" />
            </Tabs>
          </Stack>
        )}
        <Divider />

        {tab === 0 && (
         <BookingDetailsPage/>
        )}

        {tab === 1 && (
         <BookingSessionsPage/>
        )}

        {loading && <CustomLoader />}
        {error ? <Alert color="error">{error}</Alert> : null}
      </Card>
      <ToastContainer />
    </Box>
  );
}
