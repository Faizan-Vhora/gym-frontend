'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BOOKING_STATUS } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { Card, Stack, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { BookingFilters } from '@/components/admin/booking/booking-filters';
import { BookingEntry, BookingTable } from '@/components/admin/booking/booking-table';

export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [entries, setEntries] = React.useState<BookingEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [bookingTypeFilter, setBookingTypeFilter] = React.useState(searchParams.get('bookingType') || 'All');
  const [bookingStatusFilter, setBookingStatusFilter] = React.useState(searchParams.get('status') || 'All');
  const [trainerIdFilter, setTrainerIdFilter] = React.useState(searchParams.get('trainerId') || 'All');
  const [customerIdFilter, setCustomerIdFilter] = React.useState(searchParams.get('memberId') || 'All');
  const [startDateFilter, setStartDateFilter] = React.useState(searchParams.get('startDate') || '');
  const [endDateFilter, setEndDateFilter] = React.useState('');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const getSessionBookingListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const qParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        bookingType: bookingTypeFilter !== 'All' ? bookingTypeFilter : null,
        status: bookingStatusFilter !== 'All' ? bookingStatusFilter : null,
        trainerId: trainerIdFilter !== 'All' ? trainerIdFilter : null,
        customerId: customerIdFilter !== 'All' ? customerIdFilter : null,
        startDate: startDateFilter !== '' ? startDateFilter : null,
        endDate: endDateFilter !== '' ? endDateFilter : null,
      };

      const response = await axiosInstance.get<{ data: { items: BookingEntry[]; meta: { totalItems: number } } }>(
        '/session-booking',
        {
          params: {
            ...qParams,
          },
        }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems);
    } catch (error) {
      await Swal.fire('Error!', 'Error fetching session booking data', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    searchTerm,
    bookingTypeFilter,
    trainerIdFilter,
    customerIdFilter,
    startDateFilter,
    endDateFilter,
    bookingStatusFilter,
  ]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [
    searchTerm,
    trainerIdFilter,
    trainerIdFilter,
    bookingStatusFilter,
    bookingTypeFilter,
    startDateFilter,
    endDateFilter,
  ]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: searchTerm,
      trainerId: trainerIdFilter,
      memberId: customerIdFilter,
      status: bookingStatusFilter,
      bookingType: bookingTypeFilter,
      startDate: startDateFilter,
      endDate: endDateFilter,
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/bookings?${queryString}`);
  };

  const handleUpdateStatus = async (id: number, newStatus: BookingEntry['status']): Promise<void> => {
    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, update it!`;
    let swalSuccessMessage = `The status has been updated`;

    if (newStatus === BOOKING_STATUS.CANCELED) {
      swalText = `Do you want to cancel the booking?`;
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
        await axiosInstance.patch(`/session-booking/${id}/update-status/`, { status: newStatus });
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        await Swal.fire('Updated!', swalSuccessMessage, 'success');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update.', 'error');
      }
    }
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (search: string): void => {
    setSearchTerm(search);
    setPage(0);
  };

  const handleBookingTypeChange = (type: string): void => {
    setBookingTypeFilter(type);
    setPage(0);
  };

  const handleTrainerIdChange = (trainerId: string): void => {
    setTrainerIdFilter(trainerId);
    setPage(0);
  };

  const handleStatusChange = (status: string): void => {
    setBookingStatusFilter(status);
    setPage(0);
  };

  const handleCustomerIdChange = (customerId: string): void => {
    setCustomerIdFilter(customerId);
    setPage(0);
  };

  const handleStartDateChange = (startDate: string): void => {
    setStartDateFilter(startDate);
    setPage(0);
  };

  const handleEndDateChange = (endDate: string): void => {
    setEndDateFilter(endDate);
    setPage(0);
  };

  useEffect(() => {
    void getSessionBookingListData();
  }, [getSessionBookingListData]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Bookings
          </Typography>
        </Stack>
      </Stack>
      <Card>
        <Stack sx={{ padding: '30px' }}>
          <BookingFilters
            onSearchChange={handleSearchChange}
            onBookingTypeChange={handleBookingTypeChange}
            onTrainerIdChange={handleTrainerIdChange}
            onCustomerIdChange={handleCustomerIdChange}
            onStartDateChange={handleStartDateChange}
            onStatusChange={handleStatusChange}
            onEndDateChange={handleEndDateChange}
          />
        </Stack>

        {loading ? (
          <CustomLoader />
        ) : (
          <BookingTable
            entries={entries}
            page={page}
            rowsPerPage={rowsPerPage}
            totalEntries={count}
            onUpdateStatus={handleUpdateStatus}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </Card>
      <ToastContainer />
    </Stack>
  );
}
