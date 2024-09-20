'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button } from '@mui/material';
import Swal from 'sweetalert2';

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
  const [membershipFilter, setMembershipFilter] = useState<string>('ALL'); // Membership type filter
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  interface CustomerResponse {
    data: {
      items: Customer[];
      meta: { totalItems: number };
    };
  }

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<CustomerResponse>('/users', {
        params: {
          userType: 3,
          page: page + 1,
          limit: rowsPerPage,
          search: filter,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          memberShipTypeId: membershipFilter !== 'ALL' ? Number(membershipFilter) : undefined,
        },
      });
      setCustomers(response.data.data.items);
      setCount(response.data.data.meta.totalItems);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch customers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filter, statusFilter, membershipFilter]); // Include membershipFilter here

  useEffect(() => {
    // Define an async function and invoke it
    const loadCustomers = async (): Promise<void> => {
      try {
        await fetchCustomers();
      } catch (error: unknown) {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      }
    };

    void loadCustomers();
  }, [fetchCustomers]);

  const handleAddClick = (): void => {
    router.push('/dashboard/customers/form');
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filterText: string): void => {
    setFilter(filterText);
    setPage(0); // Reset to first page on filter change
  };

  const handleStatusChange = (status: string): void => {
    setStatusFilter(status);
    setPage(0); // Reset to first page on status filter change
  };

  const handleMembershipTypeChange = (membershipType: string): void => {
    setMembershipFilter(membershipType);
    setPage(0); // Reset to first page on membership type filter change
  };

  const updateCustomerStatus = async (id: string, currentStatus: number): Promise<void> => {
    const newStatus = currentStatus === 1 ? 2 : 1; // Toggle status

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${newStatus === 1 ? 'activate' : 'deactivate'} this customer.`,
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
        await fetchCustomers(); // Refresh customer data
      } catch (error: unknown) {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Members
          </Typography>
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
      <CustomersFilters
        onFilterChange={handleFilterChange}
        onStatusChange={handleStatusChange} // Pass status change handler
        onMembershipTypeChange={handleMembershipTypeChange} // Pass membership type change handler
      />
      {loading ? (
        <CustomLoader />
      ) : (
        <CustomersTable
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          rows={customers}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          updateCustomerStatus={updateCustomerStatus}
        />
      )}
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
