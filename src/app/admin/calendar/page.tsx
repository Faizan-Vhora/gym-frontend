import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';

import { config } from '@/config';
import { dayjs } from '@/lib/dayjs';
import { CalendarProvider } from '@/components/admin/calendar/calendar-context';
import { CalendarView } from '@/components/admin/calendar/calendar-view';
import type { Event, ViewMode } from '@/components/admin/calendar/types';

export const metadata = { title: `Calendar | Dashboard | ${config.site.name}` } satisfies Metadata;

const events = [
  {
    id: 'EV-007',
    trainer: 1,
    customer: 2,
    startDate: dayjs().subtract(6, 'day').set('hour', 17).set('minute', 30).toDate(),
    selectDate: dayjs().subtract(6, 'day').set('hour', 17).set('minute', 30).toDate(),
    endDate: dayjs().subtract(6, 'day').set('hour', 19).set('minute', 0).toDate(),
    bookingType: 'weekly',
    trainerRatePerHour: 50,
  },
] satisfies Event[];

interface PageProps {
  searchParams: { view?: ViewMode };
}

export default function Page({ searchParams }: PageProps): React.JSX.Element {
  const { view = 'dayGridMonth' } = searchParams;

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <CalendarProvider events={events}>
        <CalendarView view={view} />
      </CalendarProvider>
    </Box>
  );
}
