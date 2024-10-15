'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BOOKING_STATUS } from '@/utils/constant';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
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
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import Swal from 'sweetalert2';

import { paths } from '@/paths';
import axiosInstance from '@/lib/axios';
import { useDialog } from '@/hooks/use-dialog';

import { BookingSessionEntry } from '../booking/view/booking-sessions/booking-session-table';
import { BookingFormDialog } from './booking-form-dialog';
import { CalendarContext } from './calendar-context';
import { EventContent } from './event-content';
import SlotRescheduleForm from './reschedule-session-dialog';
import SessionNotesForm from './session-notes';
import SessionPreview from './session-view';
import { Toolbar } from './toolbar';
import type { ApiResponse, Event, SessionItem, ViewMode } from './types';

interface BookingFormDialogData {
  range?: { start: Date; end: Date };
}

const plugins = [dayGridPlugin, interactionPlugin, listPlugin, timeGridPlugin, timelinePlugin];

export interface CalendarViewProps {
  view?: ViewMode;
}

export function CalendarView({ view = 'dayGridMonth' }: CalendarViewProps): React.JSX.Element {
  React.useContext(CalendarContext);

  const router = useRouter();

  const calendarRef = React.useRef<Calendar | null>(null);

  const [events, setEvents] = React.useState<Event[]>([]);
  const [date, setDate] = React.useState<Date>(new Date());

  const [selectedSession, setSelectedSession] = React.useState<BookingSessionEntry | null>(null);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [trainer, selectedTrainer] = React.useState<number | null>(null);
  const [member, selectedMember] = React.useState<number | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [startDateFilter, setStarteDateFilter] = React.useState('');
  const [endDateFilter, setEndDateFilter] = React.useState('');
  const [isDialogOpenForNotes, setIsDialogOpenForNotes] = React.useState(false);
  const [isDialogOpenForRechedule, setIsDialogOpenForRechedule] = React.useState(false);

  const bookingFormDialog = useDialog<BookingFormDialogData>();

  // const currentEvent = currentEventId ? events.find((event) => event.id === currentEventId) : undefined;

  const fetchEvents = async () => {
    try {
      const params = {
        trainerId: trainer,
        customerId: member,
        startDate: startDateFilter,
        endDate: endDateFilter,
        pagination: false,
        sessionStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm,
      };
      const response = await axiosInstance.get<ApiResponse>('/session-booking/session/list', { params });
      const { data } = response.data;

      // Map the API response to FullCalendar format

      const formattedEvents: Event[] = data.map((item: SessionItem) => ({
        id: item.id.toString(), // Ensure id is a string if your Event type requires it
        title: `Trainer: ${item.trainer.fullName} | Member: ${item.customer.fullName}`,
        start: `${item.sessionDate}T${item.sessionStartTime}`, // Combine date and time
        end: `${item.sessionDate}T${item.sessionEndTime}`,
        trainer: item.trainer?.id, // Assuming item.trainer has an id property
        customer: item.customer.id, // Assuming item.customer has an id property
        selectDate: new Date(item.sessionDate), // Set to the session date
        startDate: new Date(`${item.sessionDate}T${item.sessionStartTime}`), // Convert to Date object
        endDate: new Date(`${item.sessionDate}T${item.sessionEndTime}`), // Convert to Date object
        bookingType: item.bookingType,
        trainerRatePerHour: item.trainerRatePerHour, // Assuming item has this property
        extendedProps: {
          sessionObj: item,
        },
      }));

      setEvents(formattedEvents);
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
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

  const handleTrainerSelect: (newTrainer: number) => void = (newTrainer) => {
    selectedTrainer(newTrainer);
  };

  const handleMemberSelect: (newTrainer: number) => void = (newTrainer) => {
    selectedMember(newTrainer);
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

  const handleAdd = React.useCallback(() => {
    bookingFormDialog.handleOpen();
  }, [bookingFormDialog]);

  const handleRangeSelect = React.useCallback(
    (arg: DateSelectArg) => {
      const calendarApi = calendarRef.current?.getApi();

      if (calendarApi) {
        calendarApi.unselect();
      }

      bookingFormDialog.handleOpen({ range: { start: arg.start, end: arg.end } });
    },
    [bookingFormDialog]
  );

  const handleEventSelect = React.useCallback((arg: EventClickArg) => {
    // Type assertion to specify that sessionObj is of type BookingSessionEntry
    const sessionObj = arg.event._def.extendedProps.sessionObj as BookingSessionEntry;

    // Ensure sessionObj is not undefined or null before setting it
    if (sessionObj) {
      setSelectedSession(sessionObj);
      setIsDialogOpen(true);
    }
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleNotesChange = async (payload: { notes: string }) => {
    try {
      // Call the API to update the notes
      await axiosInstance.put(`/session-booking/session/notes/${selectedSession?.id}`, {
        notes: payload.notes,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpenForNotes(false); // Close the dialog
      setSelectedSession(null);
      await fetchEvents(); // Refresh events
    } catch (error) {
      toast.error('Failed to reschedule slot');
    }
  };

  const handleOpenRescheduleDialog = () => {
    setIsDialogOpenForRechedule(true);
  };

  const handleOpenNotesDialog = () => {
    setIsDialogOpenForNotes(true);
  };

  const handleDialogCloseForNotes = () => {
    setIsDialogOpenForNotes(false);
    setSelectedSession(null);
  };

  const handleDialogCloseForRechedule = () => {
    setIsDialogOpenForRechedule(false);
    setSelectedSession(null);
  };

  // const handleEventResize = React.useCallback(
  //   (arg: EventResizeDoneArg) => {
  //     const { event } = arg;
  //     updateEvent(event.id, { start: event.start!, end: event.end! });
  //   },
  //   [updateEvent]
  // );

  // const handleEventDrop = React.useCallback(
  //   (arg: EventDropArg) => {
  //     const { event } = arg;
  //     updateEvent(event.id, { start: event.start!, end: event.end! });
  //   },
  //   [updateEvent]
  // );

  const handleUpdateStatus = async (id: string, newStatus: BookingSessionEntry['status']): Promise<void> => {
    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, update it!`;
    let swalSuccessMessage = `The status has been updated`;

    if (newStatus === BOOKING_STATUS.CANCELED) {
      swalText = `Do you want to cancel the booking?`;
      swalConfirmButtonText = `Yes, cancel it!`;
      swalSuccessMessage = `The booking has been cancelled`;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/session-booking/session/${id}/update-status/`, { status: newStatus });
        setEvents((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        await Swal.fire('Updated!', swalSuccessMessage, 'success');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update.', 'error');
        if (process.env.NODE_ENV !== 'production') {
          // Log the error in non-production
        }
      }
    }
  };

  const handleReschedule = async (payload: {
    sessionDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
  }) => {
    try {
      // Call the API to reschedule the event
      await axiosInstance.put(`/session-booking/session/update-detail/${selectedSession?.id}`, {
        sessionDate: payload.sessionDate,
        sessionStartTime: payload.sessionStartTime,
        sessionEndTime: payload.sessionEndTime,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpenForRechedule(false); // Close the dialog
      await fetchEvents(); // Refresh events
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
              // eventDrop={handleEventDrop}
              eventMinHeight={25}
              eventResizableFromStart
              // eventResize={handleEventResize}
              events={Array.from(events.values())}
              headerToolbar={false}
              height={600}
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
      {selectedSession && (
        <SlotRescheduleForm
          open={isDialogOpenForRechedule}
          onClose={handleDialogCloseForRechedule}
          onSubmit={handleReschedule}
          sessionObj={selectedSession}
        />
      )}

      {/* change notes Dialog */}
      {selectedSession && (
        <SessionNotesForm
          open={isDialogOpenForNotes}
          onClose={handleDialogCloseForNotes}
          onSubmit={handleNotesChange}
          sessionObj={selectedSession}
        />
      )}

      {/* change notes Dialog */}
      {selectedSession && (
        <SessionPreview
          open={isDialogOpen}
          onClose={handleDialogClose}
          sessionObj={selectedSession}
          openRescheduleDialog={handleOpenRescheduleDialog}
          openNotesDialog={handleOpenNotesDialog}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <ToastContainer />

      {bookingFormDialog.open ? (
        <BookingFormDialog
          onClose={bookingFormDialog.handleClose}
          onCreate={() => {
            bookingFormDialog.handleClose();
            void fetchEvents();
          }}
          open
        />
      ) : null}
    </React.Fragment>
  );
}
