'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, Card, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';

// import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import CheckinFilters from '@/components/admin/check-in/check-in-filter';
import { CheckInTable } from '@/components/admin/check-in/check-in-table';
import type { CheckInEntry } from '@/components/admin/check-in/check-in-table';

export default function CheckinPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [userTypeFilter, setUserTypeFilter] = useState(searchParams.get('userType') || 'ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const rawDateRange = searchParams.get('dateRange');
  // const [start, end] = rawDateRange ? rawDateRange.split(',') : [null, null];
  // const initialDateRange: DateRange<Dayjs> = [start ? dayjs(start) : null, end ? dayjs(end) : null];
  // const [dateRange, setDateRange] = React.useState<DateRange<Dayjs>>(initialDateRange);
  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);
  const [checkInTime, setCheckInTime] = React.useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = React.useState<string | null>(null);
  const router = useRouter();

  interface ErrorDetail {
    code?: string;
    message?: string;
  }

  interface CheckinResponse {
    data: {
      items: CheckInEntry[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  useEffect(() => {
    const fetchEntries: () => Promise<void> = async () => {
      setLoading(true);
      try {
        const params = {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchTerm,
          userType: userTypeFilter !== 'ALL' ? userTypeFilter : undefined,
          startDate: startDate,
          endDate: endDate,
          startTime: checkInTime,
          endTime: checkOutTime,
        };
        const response = await axiosInstance.get<CheckinResponse>('/entry-logs', { params });

        const { items, meta } = response.data.data;
        if (Array.isArray(items)) {
          setEntries(items);
          setTotalEntries(meta.totalItems);
        } else {
          toast.error(
            `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
          );
          setError('Unexpected data format.');
        }
      } catch (err) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching check-ins: ${err.message}`;
        }
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries().catch((err: unknown) => {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      toast.error(errorMessage);
    });
  }, [searchTerm, statusFilter, userTypeFilter, page, rowsPerPage, startDate, endDate, checkInTime, checkOutTime]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [searchTerm, statusFilter, page, rowsPerPage, userTypeFilter]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: searchTerm,
      status: statusFilter,
      page: String(page),
      rowsPerPage: String(rowsPerPage),
      userType: userTypeFilter,
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/check-in?${queryString}`);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleUserTypeChange = (newUserType: string) => {
    setUserTypeFilter(newUserType);
  };

  const handleAddClick = () => {
    router.push('/admin/check-in/form');
  };

  // const handleEdit = (id: number) => {
  //   router.push(`/admin/check-in/form?id=${id}`);
  // };

  // const handleDelete = async (id: number) => {
  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This action cannot be undone.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await axiosInstance.delete(`/entry-logs/${id}`);
  //       setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  //       toast.success('Checkin deleted successfully');
  //       setPage(0);
  //     } catch (err) {
  //       toast.error('Failed to delete Checkin');
  //     }
  //   }
  // };

  const handleStatusChange: (status: string) => void = (status) => {
    setStatusFilter(status);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (dateRangeS: DateRange<Dayjs>) => {
    const [starts, ends] = dateRangeS;
    setStartDate(starts?.format('YYYY-MM-DD') || null);
    setEndDate(ends?.format('YYYY-MM-DD') || null);
  };

  const handleTimeChange = (time: Date | null, isCheckIn: boolean) => {
    if (time) {
      const formattedTime = dayjs(time).format('HH:mm:ss'); // Format time as needed
      if (isCheckIn) {
        setCheckInTime(formattedTime); // Set check-in time
      } else {
        setCheckOutTime(formattedTime); // Set check-out time
      }
    } else {
      // Handle the case when time is cleared
      if (isCheckIn) {
        setCheckInTime(null);
      } else {
        setCheckOutTime(null);
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Checkin Management
          </Typography>
        </Stack>
        <Button
          className="common-button"
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
          style={{ fontFamily: '"Audiowide", sans-serif' }}
        >
          Add
        </Button>
      </Stack>
      <Card>
        <Stack sx={{ padding: '30px' }}>
          <CheckinFilters
            onSearchChange={handleSearchChange}
            onUserTypeChange={handleUserTypeChange}
            onStatusChange={handleStatusChange}
            onDateChange={handleDateChange}
            onCheckInTimeChange={handleTimeChange}
            onCheckOutTimeChange={handleTimeChange}
          />
        </Stack>
        {loading ? (
          <CustomLoader />
        ) : (
          <CheckInTable
            entries={entries}
            count={totalEntries}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            // onEdit={handleEdit}
            // onDelete={handleDelete}
          />
        )}
      </Card>
      {error ? <Alert color="error">{error}</Alert> : null}
      <ToastContainer />
    </Stack>
  );
}
