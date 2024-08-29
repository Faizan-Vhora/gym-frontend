'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Paper, Stack, TablePagination, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import axiosInstance from '@/lib/axios';
import ExpertiseFilters from '@/components/dashboard/expertise/expertise-filter';
import { ExpertiseEntry, ExpertiseTable } from '@/components/dashboard/expertise/expertise-table';

export default function ExpertisePage(): React.JSX.Element {
  const [entries, setEntries] = useState<ExpertiseEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ExpertiseEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch expertise entries on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axiosInstance.get('/expertise');
        if (Array.isArray(response.data.data.items)) {
          setEntries(response.data.data.items);
          setFilteredEntries(response.data.data.items);
        } else {
          console.error('Unexpected response data format:', response.data.data);
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
  }, []);

  // Apply filters when statusFilter or searchTerm changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = entries;
      if (searchTerm) {
        filtered = filtered.filter((entry) => entry.title.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter((entry) => entry.status === statusFilter);
      }
      setFilteredEntries(filtered);
      setPage(0); // Reset to first page when filters change
    };
    applyFilters();
  }, [searchTerm, statusFilter, entries]);

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
      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error('Error deleting expertise:', err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const entry = entries.find((entry) => entry.id === id);
    if (!entry) return;

    try {
      const newStatus = entry.status === 'active' ? 'inactive' : 'active';
      await axiosInstance.patch(`/expertise/update-status/${id}`, { status: newStatus });
      setEntries(entries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry)));
    } catch (err) {
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
          entries={filteredEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          page={page}
          rowsPerPage={rowsPerPage}
          totalEntries={filteredEntries.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <TablePagination
        component="div"
        count={filteredEntries.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Stack>
  );
}
