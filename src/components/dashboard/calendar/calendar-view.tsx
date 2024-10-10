'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DateFormat } from '@/utils/constant';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Calendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { paths } from '@/paths';
import axiosInstance from '@/lib/axios';
import { useDialog } from '@/hooks/use-dialog';

import { CalendarContext } from './calendar-context';
import { EventContent } from './event-content';
import { EventDialog } from './event-dialog';
import SlotRescheduleForm from './reschedule-session-dialog';
import { Toolbar } from './toolbar';
import type { Event, ViewMode, WeekSlot } from './types';
import { BookingFormDialog } from './booking-form-dialog';

interface CreateDialogData {
  range?: { start: Date; end: Date };
}

interface BookingFormDialogData {
  range?: { start: Date; end: Date };
}

const plugins = [dayGridPlugin, interactionPlugin, listPlugin, timeGridPlugin, timelinePlugin];

export interface CalendarViewProps {
  view?: ViewMode;
}

interface DaySchedule {
  weekday: number; // Weekday number (0-6, where 0 = Sunday, 6 = Saturday)
  weekSlots: WeekSlot[]; // List of week slots for that day
}

interface ScheduleResponse {
  success: boolean; // Indicates if the operation was successful
  message: string; // Response message
  data: DaySchedule[]; // List of schedules by weekday
  errors: object; // Errors if any (can be further typed if needed)
}

export function CalendarView({ view = 'dayGridMonth' }: CalendarViewProps): React.JSX.Element {
  const { currentEventId, setCurrentEventId, createEvent, deleteEvent, updateEvent } =
    React.useContext(CalendarContext);

  const router = useRouter();

  const calendarRef = React.useRef<Calendar | null>(null);

  const [events, setEvents] = React.useState<Event[]>([]);
  const [date, setDate] = React.useState<Date>(new Date());

  const [loading, setLoading] = React.useState(true);
  const [selectedSession, setSelectedSession] = React.useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [trainer, selectedTrainer] = React.useState<number | null>(null);
  const [member, selectedMember] = React.useState<number | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [startDateFilter, setStarteDateFilter] = React.useState('');
  const [endDateFilter, setEndDateFilter] = React.useState('');

  const createDialog = useDialog<CreateDialogData>();

  const bookingFormDialog = useDialog<BookingFormDialogData>();


  const currentEvent = currentEventId ? events.find((event) => event.id === currentEventId) : undefined;

  const fetchEvents = async () => {
    try {
      const params = {
        trainerId: trainer,
        customerId: member,
        startDate: startDateFilter,
        endDate: endDateFilter,
        // page: page + 1, // Adjusting for API pagination
        // limit: rowsPerPage,
        sessionStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm,
      };
      const response = await axiosInstance.get('/session-booking/session/list', { params });
      const { data } = response.data;

      // Map the API response to FullCalendar format
      const formattedEvents = data.items.map((item: any) => ({
        id: item.id,
        title: `Trainer: ${item.trainer.fullName} | Member: ${item.customer.fullName}`,
        start: `${item.sessionDate}T${item.sessionStartTime}`, // Combine date and time
        end: `${item.sessionDate}T${item.sessionEndTime}`,
        extendedProps: {
          sessionObj: item,
        },
      }));
      console.log('fetched events ', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events', error);
    }
  };

  React.useEffect(() => {
    void fetchEvents();
  }, [searchTerm, trainer, member, statusFilter, startDateFilter, endDateFilter]);

  const handleViewChange = React.useCallback(
    (value: ViewMode) => {
      const calendarApi = calendarRef.current?.getApi();

      if (calendarApi) {
        calendarApi.changeView(value);
      }

      router.push(`${paths.dashboard.calendar}?view=${value}`);
    },
    [router]
  );

  const handleSearchChange: (newSearchTerm: string) => void = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleTrainerSelect: (trainer: number) => void = (trainer) => {
    selectedTrainer(trainer);
  };

  const handleMemberSelect: (trainer: number) => void = (trainer) => {
    selectedMember(trainer);
  };

  const handleStatusChange: (status: string) => void = (status) => {
    setStatusFilter(status);
  };

  const handleStartDateChange = (startDate: string): void => {
    setStarteDateFilter(startDate);
  };

  const handleEndDateChange = (endDate: string): void => {
    setEndDateFilter(endDate);
  };

  const handleDateToday = React.useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDatePrev = React.useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDateNext = React.useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, []);

  // const handleAdd = React.useCallback(() => {
  //   createDialog.handleOpen();
  // }, [createDialog]);


  const handleAdd = React.useCallback(() => {
    bookingFormDialog.handleOpen();
  }, [bookingFormDialog]);

  const handleRangeSelect = React.useCallback(
    (arg: DateSelectArg) => {
      const calendarApi = calendarRef.current?.getApi();

      if (calendarApi) {
        calendarApi.unselect();
      }

      createDialog.handleOpen({ range: { start: arg.start, end: arg.end } });
    },
    [createDialog]
  );

  const handleEventSelect = React.useCallback((arg: EventClickArg) => {
    console.log('Event selected:', arg.event);
    setSelectedEvent(arg.event);
    setSelectedSession(arg.event._def.extendedProps.sessionObj);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventResize = React.useCallback(
    (arg: EventResizeDoneArg) => {
      const { event } = arg;
      updateEvent(event.id, { start: event.start!, end: event.end! });
    },
    [updateEvent]
  );

  const handleEventDrop = React.useCallback(
    (arg: EventDropArg) => {
      const { event } = arg;
      updateEvent(event.id, { start: event.start!, end: event.end! });
    },
    [updateEvent]
  );

  interface Slot {
    date: string; // Format: 'YYYY-MM-DD'
    weekday: number; // Weekday index
    startTime: string; // Ensure consistent formatting
    endTime: string;
    isAvailable: boolean;
  }

  interface WeekSlot {
    date: string; // e.g., '2024-10-08'
    slots: Slot[];
  }

  interface DaySchedule {
    weekday: number; // or whatever type this represents
    weekSlots: WeekSlot[];
  }

  const handleReschedule = async (payload: {
    sessionDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
  }) => {
    try {
      // Call the API to reschedule the event
      const response = await axiosInstance.put(`/session-booking/session/update-detail/${selectedEvent.id}`, {
        sessionDate: payload.sessionDate,
        sessionStartTime: payload.sessionStartTime,
        sessionEndTime: payload.sessionEndTime,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpen(false); // Close the dialog
      fetchEvents(); // Refresh events
    } catch (error) {
      toast.error('Failed to reschedule slot');
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={4}>
        <Toolbar
          date={date}
          onAdd={handleAdd}
          onViewChange={handleViewChange}
          view={view}
          onSearchChange={handleSearchChange}
          handleTrainerChange={handleTrainerSelect}
          handleMemberChange={handleMemberSelect}
          onStatusChange={handleStatusChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        <Card sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: '800px' }}>
            <Calendar
              allDayMaintainDuration
              dayMaxEventRows={3}
              droppable
              editable
              eventClick={handleEventSelect}
              eventContent={EventContent}
              eventDisplay="block"
              eventDrop={handleEventDrop}
              eventMinHeight={25}
              eventResizableFromStart
              eventResize={handleEventResize}
              events={Array.from(events.values())}
              headerToolbar={false}
              height={800}
              initialDate={date}
              initialView={view}
              plugins={plugins}
              ref={calendarRef}
              rerenderDelay={10}
              select={handleRangeSelect}
              selectable
              weekends
            />
          </Box>
        </Card>
        <Stack direction="row" spacing={3} sx={{ justifyContent: 'center' }}>
          <IconButton onClick={handleDatePrev}>
            <CaretLeftIcon />
          </IconButton>
          <Button color="secondary" onClick={handleDateToday} variant="outlined">
            Today
          </Button>
          <IconButton onClick={handleDateNext}>
            <CaretRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Slot Reschedule Dialog */}
      {selectedEvent && (
        <SlotRescheduleForm
          open={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleReschedule}
          sessionObj={selectedSession}
        />
      )}
      <ToastContainer />

      {bookingFormDialog.open ? (
        <BookingFormDialog
          onClose={bookingFormDialog.handleClose}
          onCreate={() => {
            bookingFormDialog.handleClose();
            fetchEvents();
          }}
          open
        />
      ) : null}

      {createDialog.open ? (
        <EventDialog
          action="create"
          onClose={createDialog.handleClose}
          onCreate={(params) => {
            createEvent(params);
            createDialog.handleClose();
          }}
          open
          range={createDialog.data?.range}
        />
      ) : null}


      {currentEvent ? (
        <EventDialog
          action="update"
          event={currentEvent}
          onClose={() => {
            setCurrentEventId(undefined);
          }}
          onCreate={createEvent}
          onDelete={(eventId) => {
            setCurrentEventId(undefined);
            deleteEvent(eventId);
          }}
          onUpdate={(eventId, params) => {
            updateEvent(eventId, params);
            setCurrentEventId(undefined);
          }}
          open
        />
      ) : null}
    </React.Fragment>
  );
}
