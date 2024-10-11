'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, CardHeader, Divider, Stack, Tab, Tabs } from '@mui/material';
import { ToastContainer } from 'react-toastify';

import BookingDetailsPage from './booking-details/page';
import BookingSessionsPage from './booking-sessions/page';

export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [tab, setTab] = React.useState(0); // State to control the active tab

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title={`View Booking | #${id}`} />
        {id && (
          <Stack sx={{ marginLeft: '20px' }}>
            <Divider />
            <Tabs value={tab} onChange={handleTabChange} aria-label="booking details tabs">
              <Tab label="Booking Details" style={{ fontFamily: '"Audiowide", sans-serif' }} />
              <Tab label="Booking Sessions" style={{ fontFamily: '"Audiowide", sans-serif' }} />
            </Tabs>
          </Stack>
        )}
        <Divider />

        {tab === 0 && <BookingDetailsPage />}

        {tab === 1 && <BookingSessionsPage />}
      </Card>
      <ToastContainer />
    </Box>
  );
}
