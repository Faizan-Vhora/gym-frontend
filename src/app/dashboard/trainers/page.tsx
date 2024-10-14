'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Alert, Button, Card } from '@mui/material';
import Swal from 'sweetalert2';

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
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface TrainerResponseData {
    data: {
      items: Trainer[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }
  // Fetch trainers when page, rowsPerPage, filter, or statusFilter changes
  const fetchTrainers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Define request parameters
      const params = {
        userType: 2, // Assuming userType 2 corresponds to trainers
        page: page + 1, // Adjust for 1-based API
        limit: rowsPerPage,
        search: filter,
        status: statusFilter !== 'ALL' ? statusFilter : undefined, // Status filter
      };

      // Perform the API call
      const response = await axiosInstance.get<TrainerResponseData>('/users', { params });

      // Access and handle response data
      const { items, meta } = response.data.data;
      if (Array.isArray(items)) {
        setTrainers(items); // `items` is of type `Trainer[]`
        setCount(meta.totalItems); // `meta.totalItems` is of type `number`
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
        setError('Unexpected data format.');
      }
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filter, statusFilter]); // Dependencies for memoization

  useEffect(() => {
    const loadTrainers = async (): Promise<void> => {
      try {
        await fetchTrainers();
      } catch (err: unknown) {
        err instanceof Error ? err.message : 'An unexpected error occurred';
      }
    };

    // Immediately invoke the async function and handle the promise
    loadTrainers().catch((err: unknown) => {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    });
  }, [fetchTrainers]);

  const handleAddClick = (): void => {
    router.push('/dashboard/trainers/form');
  };

  // Handles page changes triggered by the TablePagination component
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
    setPage(newPage);
  };

  // Handles changes to the number of rows displayed per page
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page on rows per page change
  };

  // Updates the search filter and resets to the first page
  const handleFilterChange = (filterText: string): void => {
    setFilter(filterText);
    setPage(0); // Reset to first page on filter change
  };

  // Updates the status filter and resets to the first page
  const handleStatusChange = (status: string): void => {
    setStatusFilter(status);
    setPage(0); // Reset to first page on status filter change
  };

  // Toggles the status of a trainer and updates the UI
  const updateTrainerStatus = async (id: string, currentStatus: number): Promise<void> => {
    const newStatus = currentStatus === 1 ? 2 : 1; // Toggle status

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${newStatus === 1 ? 'activate' : 'deactivate'} this trainer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${newStatus === 1 ? 'activate' : 'deactivate'} it!`,
    });

    // If confirmed, proceed with the status update
    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/users/update-status/${id}`, { status: newStatus });
        toast.success(`Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`);
        await fetchTrainers();
      } catch (err: unknown) {
        err instanceof Error ? err.message : 'An unexpected error occurred';
      }
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
          <TrainersFilters
            onFilterChange={handleFilterChange}
            onStatusChange={handleStatusChange} // Pass status change handler
          />
        </Stack>
        {loading ? (
          <CustomLoader />
        ) : (
          <TrainersTable
            count={count}
            page={page}
            rowsPerPage={rowsPerPage}
            rows={trainers}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            updateTrainerStatus={updateTrainerStatus}
          />
        )}
      </Card>
      {error ? <Alert color="error">{error}</Alert> : null}
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
