'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '@/lib/axios';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import type { Customer } from '@/components/dashboard/customer/customers-table';

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filter, setFilter] = useState<string>(''); // Search filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // Status filter

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/users', {
        params: {
          userType: 3,
          page: page + 1, // Page is 0-based in MUI, adjust for 1-based API
          limit: rowsPerPage,
          search: filter,
          status: statusFilter !== 'ALL' ? statusFilter : undefined, // Status filter
        },
      });
      setCustomers(response.data.data.items);
      setCount(response.data.data.meta.itemCount);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  }, [page, rowsPerPage, filter, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]); // Fetch customers when fetchCustomers changes

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

  const updateCustomerStatus = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1; // Toggle status
    try {
      await axiosInstance.patch(`/users/update-status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`);
      fetchCustomers(); // Refresh customer data
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
            Customers
          </Typography>
        </Stack>
      </Stack>
      <CustomersFilters
        onFilterChange={handleFilterChange}
        onStatusChange={handleStatusChange} // Pass status change handler
      />
      <CustomersTable
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rows={customers}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        updateCustomerStatus={updateCustomerStatus}
      />
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
