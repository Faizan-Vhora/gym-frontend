'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
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

import axiosInstance from '@/lib/axios';
import { ContactUsFilters } from '@/components/dashboard/contact-us/contact-us-filters';
import { ContactUsEntry, ContactUsTable } from '@/components/dashboard/contact-us/contact-us-table';

export default function Page(): React.JSX.Element {
  const [entries, setEntries] = useState<ContactUsEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromFilter, setFromFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchEntries();
  }, [page, rowsPerPage, searchTerm, statusFilter, fromFilter]);

  const fetchEntries = async () => {
    try {
      const response = await axiosInstance.get('/contact-us', {
        params: {
          page: page + 1, // Page number (API might expect 1-indexed pages)
          limit: rowsPerPage, // Number of rows per page
          search: searchTerm, // Search term
          type: fromFilter !== 'ALL' ? fromFilter : undefined, // From filter
          status: statusFilter !== 'ALL' ? statusFilter : undefined, // Status filter
        },
      });
      setEntries(response.data.data.items);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleFromChange = (type: string) => {
    setFromFilter(type);
  };

  const handleUpdateStatus = async (id: number, newStatus: ContactUsEntry['status']) => {
    try {
      await axiosInstance.patch(`/contact-us/update-status/${id}`, { status: newStatus }); // Replace with your API endpoint
      setEntries((prevEntries) =>
        prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
  };

  const paginatedEntries = applyPagination(entries, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Contact Us</Typography>
        </Stack>
      </Stack>
      <ContactUsFilters
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onFromChange={handleFromChange}
      />
      {entries.length === 0 ? (
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
          entries={paginatedEntries}
          page={page}
          rowsPerPage={rowsPerPage}
          totalEntries={entries.length}
          onUpdateStatus={handleUpdateStatus}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Stack>
  );
}

function applyPagination(entries: ContactUsEntry[], page: number, rowsPerPage: number): ContactUsEntry[] {
  return entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
