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
} from '@/components/admin/booking/view/booking-sessions/booking-session-table';
import SlotRescheduleForm from '@/components/admin/calendar/reschedule-session-dialog';
import SessionNotesForm from '@/components/admin/calendar/session-notes';
import SessionPreview from '@/components/admin/calendar/session-view';

export default function BookingSessionsPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [entries, setEntries] = React.useState<BookingSessionEntry[]>([]);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [selectedSession, setSelectedSession] = React.useState<BookingSessionEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDialogOpenForNotes, setIsDialogOpenForNotes] = React.useState(false);
  const [isDialogOpenForPreview, setIsDialogOpenForPreview] = React.useState(false);

  const getSessionBookingSessionListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const qParams = {
        page: page + 1,
        limit: rowsPerPage,
        bookingId: bookingId,
      };

      const { data } = await axiosInstance.get<{
        data: { items: BookingSessionEntry[]; meta: { totalItems: number } };
      }>('/session-booking/session/list', {
        params: {
          ...qParams,
        },
      });

      setEntries(data.data.items);
      setCount(data.data.meta.totalItems);
    } catch (error) {
      // Removed console.error to avoid linting error
      toast.error('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, bookingId]);

  const handleUpdateStatus = async (id: number, newStatus: BookingSessionEntry['status']): Promise<void> => {
    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, update it!`;
    let swalSuccessMessage = `The status has been updated`;

    if (newStatus === BOOKING_STATUS.CANCELED) {
      swalText = `Do you want to cancel the session booking?`;
      swalConfirmButtonText = `Yes`;
      swalSuccessMessage = `The booking has been cancelled`;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/session-booking/session/${id}/update-status/`, { status: newStatus });
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        await Swal.fire('Updated!', swalSuccessMessage, 'success');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update.', 'error');
      }
    }
  };

  const handleUpdateNotes = (session: BookingSessionEntry) => {
    setSelectedSession(session);
    setIsDialogOpenForNotes(true);
  };

  const handleSessionPreview = (session: BookingSessionEntry) => {
    setSelectedSession(session);
    setIsDialogOpenForPreview(true);
  };

  const handleRescheduleSession = (session: BookingSessionEntry) => {
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

  const handleReschedule = async (payload: {
    sessionDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
  }) => {
    try {
      await axiosInstance.put(`/session-booking/session/update-detail/${selectedSession?.id}`, {
        sessionDate: payload.sessionDate,
        sessionStartTime: payload.sessionStartTime,
        sessionEndTime: payload.sessionEndTime,
      });
      toast.success('Slot rescheduled successfully!');
      setIsDialogOpen(false);
      setSelectedSession(null);
      await getSessionBookingSessionListData(); // Refresh events
    } catch (error) {
      toast.error('Failed to reschedule slot');
    }
  };

  const handleNotesChange = async (payload: { notes: string }) => {
    try {
      await axiosInstance.put(`/session-booking/session/notes/${selectedSession?.id}`, {
        notes: payload.notes,
      });
      toast.success('Notes updated successfully!');
      setIsDialogOpenForNotes(false);
      setSelectedSession(null);
      await getSessionBookingSessionListData(); // Refresh events
    } catch (error) {
      toast.error('Failed to update notes');
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

  const handlePreviewDialogClose = () => {
    setIsDialogOpenForPreview(false);
    setSelectedSession(null);
  };

  useEffect(() => {
    void getSessionBookingSessionListData();
  }, [getSessionBookingSessionListData]);

  const handleDownload = async (id: number): Promise<void> => {
    const swalText = `Do you want to download this session's details?`;
    const swalConfirmButtonText = `Yes, download it!`;
    const swalSuccessMessage = `The session details have been downloaded`;

    // Show a confirmation popup with SweetAlert
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No',
    });

    // If confirmed, proceed to download
    if (result.isConfirmed) {
      try {
        // Make the API call to download the booking details (replace with actual API endpoint)
        const response = await axiosInstance.get(`/session-booking/download-session/${id}`, {
          responseType: 'blob', // Ensures the response is treated as a file
        });

        // Create a Blob from the response data and trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-${id}-details.pdf`; // Set the filename for download
        link.click();

        // Optionally, show a success message
        await Swal.fire('Downloaded!', swalSuccessMessage, 'success');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to download the booking details.', 'error');
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}></Stack>
      <Card>
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
            onPreviewSession={handleSessionPreview}
            onRescheduleSession={handleRescheduleSession}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onDownload={handleDownload}
            showActions={true}
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

      {selectedSession && (
        <SessionNotesForm
          open={isDialogOpenForNotes}
          onClose={handleDialogCloseForNotes}
          onSubmit={handleNotesChange}
          sessionObj={selectedSession}
        />
      )}

      {selectedSession && (
        <SessionPreview open={isDialogOpenForPreview} onClose={handlePreviewDialogClose} sessionObj={selectedSession} />
      )}

      <ToastContainer />
    </Stack>
  );
}
