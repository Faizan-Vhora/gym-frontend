'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { SupportFilters } from '@/components/admin/support/support-filters';
import type { SupportEntry } from '@/components/admin/support/support-table'; // Use import type here
import { SupportTable } from '@/components/admin/support/support-table';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State variables
  const [entries, setEntries] = React.useState<SupportEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get('status') || 'All');
  const [fromFilter, setFromFilter] = React.useState(searchParams.get('from') || 'All');
  const [page, setPage] = React.useState<number>(searchParams.get('page') ? Number(searchParams.get('page')) : 0);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    searchParams.get('rowsPerPage') ? Number(searchParams.get('rowsPerPage')) : 10
  );
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  // Fetch support list data
  const getSupportListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const qParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        userType: fromFilter !== 'All' ? fromFilter : null,
        status: statusFilter !== 'All' ? statusFilter : null,
      };

      const response = await axiosInstance.get<{ data: { items: SupportEntry[]; meta: { totalItems: number } } }>(
        '/support-ticket',
        { params: qParams }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems);
    } catch (error) {
      await Swal.fire('Error!', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, fromFilter]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [searchTerm, statusFilter, page, rowsPerPage, fromFilter]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: searchTerm,
      status: statusFilter,
      from: fromFilter,
      page: String(page),
      rowsPerPage: String(rowsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/support?${queryString}`);
  };

  const handleAddClick = (): void => {
    router.push(`/admin/support/form`);
  };

  const handleUpdateStatus = async (id: number, newStatus: SupportEntry['status']): Promise<void> => {
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
        await axiosInstance.patch(`/support-ticket/update-status/${id}`, { status: newStatus });
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        await Swal.fire('Updated!', 'The status has been updated.', 'success');
        router.push('/admin/support');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update status.', 'error');
      }
    }
  };

  const handlePageChange = (newPage: number): void => {
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
    setPage(0);
  };

  const handleFromChange = (type: string): void => {
    setFromFilter(type);
    setPage(0);
  };

  // Lifecycle hooks
  useEffect(() => {
    void getSupportListData(); // Ignore the warning
  }, [getSupportListData]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Support
          </Typography>
        </Stack>
        <Button
          className="common-button"
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Stack>
      <Card>
        <Stack sx={{ padding: '30px' }}>
          <SupportFilters
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onFromChange={handleFromChange}
          />
        </Stack>

        {loading ? (
          <CustomLoader />
        ) : (
          <SupportTable
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
      <ToastContainer />
    </Stack>
  );
}
