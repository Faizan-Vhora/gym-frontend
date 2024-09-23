'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import ExpertiseFilters from '@/components/dashboard/expertise/expertise-filter';
import { ExpertiseTable } from '@/components/dashboard/expertise/expertise-table';
import type { ExpertiseEntry } from '@/components/dashboard/expertise/expertise-table';

export default function ExpertisePage(): React.JSX.Element {
  const [entries, setEntries] = useState<ExpertiseEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface ExpertiseResponse {
    data: {
      items: ExpertiseEntry[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail; // Define this if your API returns errors in a structured format
  }

  useEffect(() => {
    const fetchEntries: () => Promise<void> = async () => {
      setLoading(true);
      try {
        const params = {
          page: page + 1, // Adjusting for API pagination
          limit: rowsPerPage,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchTerm,
        };
        const response = await axiosInstance.get<ExpertiseResponse>('/expertise', { params });

        const { items, meta } = response.data.data;
        if (Array.isArray(items)) {
          setEntries(items);
          setTotalEntries(meta.totalItems); // Assuming the API returns total count
        } else {
          toast.error(
            `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
          );
          setError('Unexpected data format.');
        }
      } catch (err) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching expertise: ${err.message}`;
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
        errorMessage = err.message; // Safely access the message property
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
    });
  }, [searchTerm, statusFilter, page, rowsPerPage]);

  const handleSearchChange: (newSearchTerm: string) => void = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleStatusChange: (status: string) => void = (status) => {
    setStatusFilter(status);
  };

  const handleAddClick: () => void = () => {
    router.push('/dashboard/expertise/form');
  };

  const handleEdit: (id: number) => void = (id) => {
    router.push(`/dashboard/expertise/form?id=${id}`);
  };

  const handleDelete: (id: number) => Promise<void> = async (id) => {
    // Prompt user with SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/expertise/${id}`);
        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
        // Trigger a refetch to refresh data
        toast.success('Expertise deleted successfully');
        setPage(0); // Reset or update the page state if necessary
      } catch (err) {
        toast.error('Failed to delete Expertise');
      }
    }
  };

  const handleToggleStatus: (id: number) => Promise<void> = async (id) => {
    const entry = entries.find((entry) => entry.id === id);
    if (!entry) return;

    // Prompt user with SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to change the status to ${entry.status === 'active' ? 'inactive' : 'active'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const newStatus = entry.status === 'active' ? 'inactive' : 'active';
        await axiosInstance.patch(`/expertise/update-status/${id}`, { status: newStatus });
        // Optimistically update the status in the UI
        setEntries((prevEntries) =>
          prevEntries.map((currentEntry) =>
            currentEntry.id === id ? { ...currentEntry, status: newStatus } : currentEntry
          )
        );
        toast.success(`Status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    }
  };

  const handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void = (
    event,
    newPage
  ) => {
    // Function implementation here
    setPage(newPage);
  };

  const handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void = (
    event
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Expertise Management</Typography>
        </Stack>
        <Button
          className="common-button"
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Stack>
      <Card>
        <Stack sx={{padding:'30px'}}>
          
      <ExpertiseFilters onSearchChange={handleSearchChange} onStatusChange={handleStatusChange} />
        </Stack>
      {loading ? (
        <CustomLoader />
      ) : (
        <ExpertiseTable
          entries={entries}
          count={totalEntries}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalEntries={totalEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
      </Card>
      {error ? <Alert color="error">{error}</Alert> : null}
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
