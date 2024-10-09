'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { CustomLoader } from '@/utils/loader';
import {
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { BookingEntry, BookingTable } from '@/components/dashboard/booking/booking-table';
import { BookingFilters } from '@/components/dashboard/booking/booking-filters';
import { BOOKING_STATUS } from '@/utils/constant';


export default function Page(): React.JSX.Element {

  const router = useRouter();

  // <variables> (start)

  const [pageTitle, setPageTitle] = React.useState('Bookings');
  const [entries, setEntries] = React.useState<BookingEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [bookingTypeFilter, setBookingTypeFilter] = React.useState('All');
  const [trainerIdFilter, setTrainerIdFilter] = React.useState('All');
  const [customerIdFilter, setCustomerIdFilter] = React.useState('All');
  const [startDateFilter, setStarteDateFilter] = React.useState('');
  const [endDateFilter, setEndDateFilter] = React.useState('');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  // <variables> (end)



  // < methods> (start)

  const getSessionBookingListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {

      const qParams = {
        page: page + 1,
        limit: rowsPerPage, // Number of rows per page
        search: searchTerm, // Search term
        bookingType: bookingTypeFilter !== 'All' ? bookingTypeFilter : null,
        trainerId: trainerIdFilter !== 'All' ? trainerIdFilter : null,
        customerId: customerIdFilter !== 'All' ? customerIdFilter : null,
        startDate: startDateFilter !== '' ? startDateFilter : null,
        endDate: endDateFilter !== '' ? endDateFilter : null,
        status: statusFilter !== 'All' ? statusFilter : null,
      }

      const response = await axiosInstance.get<{ data: { items: BookingEntry[]; meta: { totalItems: number } } }>(
        '/session-booking',
        {
          params: {
            ...qParams
          },
        }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems); // Total number of items for pagination controls
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, bookingTypeFilter, trainerIdFilter, customerIdFilter, startDateFilter, endDateFilter]);


  // const handleAddClick = (): void => {
  //   router.push('/dashboard/support/form');
  // };

  const handleUpdateStatus = async (id: number, newStatus: BookingEntry['status']): Promise<void> => {

    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, update it!`;
    let swalSuccessMessage = `The status has been updated`;

    if(newStatus == BOOKING_STATUS.CANCELED){

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
        await axiosInstance.patch(`/session-booking/${id}/update-status/`, { status: newStatus });
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

  const handleStatusChange = (status: string): void => {
    setStatusFilter(status);
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


  const handleCustomerIdChange = (customerId: string): void => {
    setCustomerIdFilter(customerId);
    setPage(0);
  };

  const handleStartDateChange = (startDate: string): void => {
    setStarteDateFilter(startDate);
    setPage(0);
  };

  const handleEndDateChange = (endDate: string): void => {
    setEndDateFilter(endDate);
    setPage(0);
  };



  // <methods hooks> (end)


  // <lifecycle hooks> (start)
  useEffect(() => {
    void getSessionBookingListData();
  }, [getSessionBookingListData]);
  // <lifecycle hooks> (end)


  // <template> (start)

  return (

    <Stack spacing={3}>
    <Stack direction="row" spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
          {pageTitle}
        </Typography>
      </Stack>
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

      <Stack sx={{ padding: '30px' }}>
         <BookingFilters
         onSearchChange={handleSearchChange}
         onStatusChange={handleStatusChange}
         onBookingTypeChange={handleBookingTypeChange}
         onTrainerIdChange={handleTrainerIdChange}
         onCustomerIdChange={handleCustomerIdChange}
         onStartDateChange={handleStartDateChange}
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

  // <template> (end)

}
