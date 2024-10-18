'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { CustomLoader } from '@/utils/loader';
import {
  Card,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { ContactUsFilters } from '@/components/dashboard/contact-us/contact-us-filters';
import type { ContactUsEntry } from '@/components/dashboard/contact-us/contact-us-table';
import { ContactUsTable } from '@/components/dashboard/contact-us/contact-us-table';

export default function Page(): React.JSX.Element {
  const [entries, setEntries] = React.useState<ContactUsEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [fromFilter, setFromFilter] = React.useState('ALL');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const fetchEntries = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ data: { items: ContactUsEntry[]; meta: { totalItems: number } } }>(
        '/contact-us',
        {
          params: {
            page: page + 1, // Page number (API might expect 1-indexed pages)
            limit: rowsPerPage, // Number of rows per page
            search: searchTerm, // Search term
            type: fromFilter !== 'ALL' ? fromFilter : undefined, // From filter
            status: statusFilter !== 'ALL' ? statusFilter : undefined, // Status filter
          },
        }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems); // Total number of items for pagination controls
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, fromFilter]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const handleSearchChange = (search: string): void => {
    setSearchTerm(search);
  };

  const handleStatusChange = (status: string): void => {
    setStatusFilter(status);
  };

  const handleFromChange = (type: string): void => {
    setFromFilter(type);
  };

  const handleUpdateStatus = async (id: number, newStatus: ContactUsEntry['status']): Promise<void> => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the status?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/contact-us/update-status/${id}`, { status: newStatus });
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        // Swal.fire('Updated!', 'The status has been updated.', 'success');
      } catch (error) {
        // Swal.fire('Error!', 'Failed to update status.', 'error');
        if (process.env.NODE_ENV !== 'production') {
          // console.error('Failed to update status:', error);
        }
      }
    }
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number): void => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page to 0 when changing rows per page
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Contact Us</Typography>
        </Stack>
      </Stack>

      <Card>
        {/* Search Field */}
        <Stack sx={{ padding: '30px' }}>
          <ContactUsFilters
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onFromChange={handleFromChange}
          />
        </Stack>
        {loading ? (
          <CustomLoader />
        ) : entries.length === 0 ? (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>User Details</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Signed Up</TableCell>
                  <TableCell>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="h6" align="center">
                      No data found
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <ContactUsTable
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
    </Stack>
  );
}
