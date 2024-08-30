'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, TablePagination, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '@/lib/axios';
import ExpertiseFilters from '@/components/dashboard/expertise/expertise-filter';
import { ExpertiseEntry, ExpertiseTable } from '@/components/dashboard/expertise/expertise-table';

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

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const params = {
          page: page + 1, // Adjusting for API pagination
          limit: rowsPerPage,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchTerm,
        };
        const response = await axiosInstance.get('/expertise', { params });
        if (response.data.data.items && Array.isArray(response.data.data.items)) {
          setEntries(response.data.data.items);
          setTotalEntries(response.data.data.meta.totalItems); // Assuming the API returns total count
        } else {
          console.error('Unexpected response data format:', response.data.errors);
          setError('Unexpected data format.');
        }
      } catch (err) {
        console.error('Error fetching expertise:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [searchTerm, statusFilter, page, rowsPerPage]);

  const handleSearchChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleAddClick = () => {
    router.push('/dashboard/expertise/form');
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/expertise/form?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/expertise/${id}`);
      // Trigger a refetch to refresh data
      toast.success(`Expertise deleted successfully`);
      setPage(0);
    } catch (err) {
      toast.error('Failed to delete Expertise');
      console.error('Error deleting expertise:', err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const entry = entries.find((entry) => entry.id === id);
    if (!entry) return;

    try {
      const newStatus = entry.status === 'active' ? 'inactive' : 'active';
      await axiosInstance.patch(`/expertise/update-status/${id}`, { status: newStatus });
      // Optimistically update the status in the UI
      setEntries((prevEntries) =>
        prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
      );
      toast.success(`Status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Error toggling status:', err);
    }
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          Add Expertise
        </Button>
      </Stack>
      <ExpertiseFilters onSearchChange={handleSearchChange} onStatusChange={handleStatusChange} />
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <ExpertiseTable
          entries={entries}
          page={page}
          rowsPerPage={rowsPerPage}
          totalEntries={totalEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
      <TablePagination
        component="div"
        count={totalEntries}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
