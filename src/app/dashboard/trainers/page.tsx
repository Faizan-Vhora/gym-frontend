'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer

import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '@/lib/axios';
import { TrainersFilters } from '@/components/dashboard/trainer/trainer-filters';
import { TrainersTable } from '@/components/dashboard/trainer/trainer-table';
import type { Trainer } from '@/components/dashboard/trainer/trainer-table';

export default function TrainersPage(): React.JSX.Element {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState(''); // Search filter
  const [statusFilter, setStatusFilter] = useState('ALL'); // Status filter

  // Fetch trainers when page, rowsPerPage, filter, or statusFilter changes
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axiosInstance.get('/users', {
          params: {
            userType: 2, // Assuming userType 2 corresponds to trainers
            page: page + 1, // Adjust for 1-based API
            limit: rowsPerPage,
            search: filter,
            status: statusFilter !== 'ALL' ? statusFilter : undefined, // Status filter
          },
        });
        setTrainers(response.data.data.items);
        setCount(response.data.data.meta.itemCount);
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
      }
    };

    fetchTrainers();
  }, [page, rowsPerPage, filter, statusFilter]); // Re-fetch when page, rowsPerPage, filter, or statusFilter changes

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page on rows per page change
  };

  const handleFilterChange = (filterText: string) => {
    setFilter(filterText);
    setPage(0); // Reset to first page on filter change
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(0); // Reset to first page on status filter change
  };

  const updateTrainerStatus = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1; // Toggle status
    try {
      await axiosInstance.patch(`/users/update-status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`);
      // Call fetchTrainers to refresh data
      const response = await axiosInstance.get('/users', {
        params: {
          userType: 2,
          page: page + 1,
          limit: rowsPerPage,
          search: filter,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setTrainers(response.data.data.items);
      setCount(response.data.data.meta.itemCount);
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Failed to update status', error);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Trainers
          </Typography>
        </Stack>
      </Stack>
      <TrainersFilters
        onFilterChange={handleFilterChange}
        onStatusChange={handleStatusChange} // Pass status change handler
      />
      <TrainersTable
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rows={trainers}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        updateTrainerStatus={updateTrainerStatus}
      />
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
