'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Card, CardHeader, Divider, Stack, Tab, Tabs } from '@mui/material';
import { ToastContainer } from 'react-toastify';

import BookingDetailsPage from './booking-details/page';
import BookingSessionsPage from './booking-sessions/page';

export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [tab, setTab] = React.useState(1); // State to control the active tab
  const router = useRouter();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  React.useEffect(() => {
    if (searchParams.get('tab') && ['1', '2'].includes(searchParams.get('tab') || '')) {
      setTab(Number(searchParams.get('tab')));
    }
  }, []);

  React.useEffect(() => {
    router.push(`/admin/bookings/view?id=${id}&tab=${tab}`);
  }, [tab]);

  return (
    <Box>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title={`View Booking | #${id}`} />
        {id && (
          <Stack sx={{ marginLeft: '20px' }}>
            <Divider />
            <Tabs value={tab} onChange={handleTabChange} aria-label="booking details tabs">
              <Tab value={1} label="Booking Details" style={{ fontFamily: '"Audiowide", sans-serif' }} />
              <Tab value={2} label="Booking Sessions" style={{ fontFamily: '"Audiowide", sans-serif' }} />
            </Tabs>
          </Stack>
        )}
        <Divider />

        {tab === 1 && <BookingDetailsPage />}

        {tab === 2 && <BookingSessionsPage />}
      </Card>
      <ToastContainer />
    </Box>
  );
}
