'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOOKING_STATUS } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { Card, Stack } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import {
  BookingSessionEntry,
  BookingSessionTable,
} from '@/components/dashboard/booking/view/booking-sessions/booking-session-table';
import SlotRescheduleForm from '@/components/dashboard/calendar/reschedule-session-dialog';
import SessionNotesForm from '@/components/dashboard/calendar/session-notes';

export default function BookingSessionsPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  // <variables> (start)

  const [entries, setEntries] = React.useState<BookingSessionEntry[]>([]);
  // const [searchTerm, setSearchTerm] = React.useState('');
  // const [statusFilter, setStatusFilter] = React.useState('All');
  // const [bookingTypeFilter, setBookingTypeFilter] = React.useState('All');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [selectedSession, setSelectedSession] = React.useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDialogOpenForNotes, setIsDialogOpenForNotes] = React.useState(false);

  // <variables> (end)

  // < methods> (start)

  const getSessionBookingSessionListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const qParams = {
        page: page + 1,
        limit: rowsPerPage, // Number of rows per page
        // search: searchTerm, // Search term
        bookingId: bookingId,
        // bookingType: bookingTypeFilter !== 'All' ? bookingTypeFilter : null,
        // status: statusFilter !== 'All' ? statusFilter : null,
      };

      const response = await axiosInstance.get<{
        data: { items: BookingSessionEntry[]; meta: { totalItems: number } };
      }>('/session-booking/session/list', {
        params: {
          ...qParams,
        },
      });

      console.log('sessions: response: ', response);

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems); // Total number of items for pagination controls
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // const handleAddClick = (): void => {
  //   router.push('/dashboard/support/form');
  // };

  const handleUpdateStatus = async (id: number, newStatus: BookingSessionEntry['status']): Promise<void> => {
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
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        Swal.fire('Updated!', swalSuccessMessage, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to update.', 'error');
        if (process.env.NODE_ENV !== 'production') {
          // console.error('Failed to update status:', error);
        }
      }
    }
  };

  const handleUpdateNotes = async (session: BookingSessionEntry) => {
    setSelectedSession(session);
    setIsDialogOpenForNotes(true);
  };

  const handleRescheduleSession = async (session: BookingSessionEntry) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleSearchChange = (search: string): void => {
  //   setSearchTerm(search);
  //   setPage(0);
  // };

  // const handleStatusChange = (status: string): void => {
  //   setStatusFilter(status);
  //   setPage(0);
  // };

  // const handleBookingTypeChange = (type: string): void => {
  //   setBookingTypeFilter(type);
  //   setPage(0);
  // };
  // <methods hooks> (end)

  const handleReschedule = async (payload: {
    sessionDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
  }) => {
    try {
      // Call the API to reschedule the event
      const response = await axiosInstance.put(`/session-booking/session/update-detail/${selectedSession.id}`, {
        sessionDate: payload.sessionDate,
        sessionStartTime: payload.sessionStartTime,
        sessionEndTime: payload.sessionEndTime,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpen(false); // Close the dialog
      setSelectedSession(null);
      getSessionBookingSessionListData(); // Refresh events
    } catch (error) {
      toast.error('Failed to reschedule slot');
    }
  };

  const handleNotesChange = async (payload: { notes: string }) => {
    try {
      // Call the API to reschedule the event
      const response = await axiosInstance.put(`/session-booking/session/notes/${selectedSession.id}`, {
        notes: payload.notes,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpenForNotes(false); // Close the dialog
      setSelectedSession(null);
      getSessionBookingSessionListData(); // Refresh events
    } catch (error) {
      toast.error('Failed to reschedule slot');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSession(null);
  };

  const handleDialogCloseForNotes = () => {
    setIsDialogOpenForNotes(false);
    setSelectedSession(null);
  };

  // <lifecycle hooks> (start)
  useEffect(() => {
    void getSessionBookingSessionListData();
  }, [getSessionBookingSessionListData]);
  // <lifecycle hooks> (end)

  // <template> (start)

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        {/* <Button
        className="common-button"
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        variant="contained"
        onClick={handleAddClick}
      >
        Add
      </Button> */}
      </Stack>
      <Card>
        {/* <Stack sx={{ padding: '30px' }}>
         <BookingFilters
         onSearchChange={handleSearchChange}
         onStatusChange={handleStatusChange}
         onBookingTypeChange={handleBookingTypeChange}
       />
      </Stack> */}

        {loading ? (
          <CustomLoader />
        ) : (
          <BookingSessionTable
            entries={entries}
            page={page}
            rowsPerPage={rowsPerPage}
            totalEntries={count}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onRescheduleSession={handleRescheduleSession}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </Card>

      {selectedSession && (
        <SlotRescheduleForm
          open={isDialogOpen}
          onClose={handleDialogClose}
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

      <ToastContainer />
    </Stack>
  );

  // <template> (end)
}
