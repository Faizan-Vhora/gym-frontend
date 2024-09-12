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

import axiosInstance from '@/lib/axios';
import { MembershipPlanFilters } from '@/components/dashboard/membership-plan/mebership-plan-filters';
import { MembershipPlanTable } from '@/components/dashboard/membership-plan/membership-plan-table';
import type { MembershipPlans } from '@/components/dashboard/membership-plan/membership-plan-table';

export default function MembershipPlanPage(): React.JSX.Element {
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlans[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // Status filter
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const router = useRouter();

  interface MembershipPlanResponse {
    data: {
      items: MembershipPlans[];
      meta: { totalItems: number };
    };
  }

  const fetchMembershipPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<MembershipPlanResponse>('/membership-types', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm, // Search term
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setMembershipPlans(response.data.data.items);
      setCount(response.data.data.meta.totalItems);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch customers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    // Define an async function and invoke it
    const loadMembershipPlans = async (): Promise<void> => {
      try {
        await fetchMembershipPlans();
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

    void loadMembershipPlans();
  }, [fetchMembershipPlans]);

  const handleAddClick = (): void => {
    router.push('/dashboard/membership-plan/form');
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (search: string): void => {
    setSearchTerm(search);
    setPage(0);
  };

  const handleStatusChange = (status: string): void => {
    setStatusFilter(status);
    setPage(0); // Reset to first page on status filter change
  };

  const updatePlanStatus = async (id: string, currentStatus: string): Promise<void> => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'; // Toggle status
    try {
      await axiosInstance.patch(`/membership-types/update-status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
      await fetchMembershipPlans(); // Refresh customer data
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

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Membership Plan
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
      <MembershipPlanFilters
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange} // Pass status change handler
      />
      {loading ? (
        <CustomLoader />
      ) : (
        <MembershipPlanTable
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          rows={membershipPlans}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          updatePlanStatus={updatePlanStatus}
        />
      )}
      <ToastContainer /> {/* Add ToastContainer here */}
    </Stack>
  );
}
