'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify'; // Import the toast function

import 'react-toastify/dist/ReactToastify.css';

import { useRouter, useSearchParams } from 'next/navigation';
import { MEMBERSHIP_PLAN_STATUS } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { Button, Card } from '@mui/material';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { CustomersFilters } from '@/components/admin/customer/customers-filters';
import { CustomersTable } from '@/components/admin/customer/customers-table';
import type { Customer } from '@/components/admin/customer/customers-table';
import { MembershipType } from '@/components/admin/subscriptions/subscription-table';

export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(searchParams.get('page') ? Number(searchParams.get('page')) : 0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    searchParams.get('rowsPerPage') ? Number(searchParams.get('rowsPerPage')) : 10
  );
  const [filter, setFilter] = useState<string>(searchParams.get('search') || ''); // Search filter
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL'); // Status filter
  const [membershipFilter, setMembershipFilter] = useState<string>(searchParams.get('membershipTypeId') || 'ALL'); // Membership type filter
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
          membershipTypeId: membershipFilter !== 'ALL' ? Number(membershipFilter) : undefined,
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
        error instanceof Error ? error.message : 'An unexpected error occurred';
      }
    };

    void loadCustomers();
  }, [fetchCustomers]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [filter, statusFilter, membershipFilter, page, rowsPerPage]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: filter,
      status: statusFilter,
      membershipTypeId: membershipFilter,
      page: String(page),
      rowsPerPage: String(rowsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/customers?${queryString}`);
  };

  const handleAddClick = (): void => {
    router.push('/admin/customers/form');
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
        error instanceof Error ? error.message : 'An unexpected error occurred';
      }
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: MembershipType['status']): Promise<void> => {
    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, `;
    let swalSuccessMessage = `The status has been updated`;

    if (newStatus === MEMBERSHIP_PLAN_STATUS.CANCEL) {
      swalText = `Do you want to cancel the subscription?`;
      swalConfirmButtonText = `Yes`;
      swalSuccessMessage = `The subscription has been cancelled`;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/users/membership/update-status/${id}`, { status: newStatus });
        await fetchCustomers(); // Refresh customer data
        toast.success(swalSuccessMessage);
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update.', 'error');
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
          style={{ fontFamily: 'Audiowide, sans-serif' }}
        >
          Add
        </Button>
      </Stack>
      <Card>
        <Stack sx={{ padding: '30px' }}>
          <CustomersFilters
            onFilterChange={handleFilterChange}
            onStatusChange={handleStatusChange} // Pass status change handler
            onMembershipTypeChange={handleMembershipTypeChange} // Pass membership type change handler
          />
        </Stack>

        {loading ? (
          <CustomLoader />
        ) : (
          <CustomersTable
            count={count}
            page={searchParams.get('page') ? Number(searchParams.get('page')) : page}
            rowsPerPage={rowsPerPage}
            rows={customers}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            updateCustomerStatus={updateCustomerStatus}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
