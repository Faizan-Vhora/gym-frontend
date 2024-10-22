'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { NotificationFilters } from '@/components/dashboard/notification/notification-filter';
import { NotificationEntry, NotificationTable } from '@/components/dashboard/notification/notification-table';

export default function Page(): React.JSX.Element {
  const router = useRouter();

  // State variables
  const [entries, setEntries] = React.useState<NotificationEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  // Fetch support list data
  const getNotificationListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const qParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };

      const response = await axiosInstance.get<{ data: { items: NotificationEntry[]; meta: { totalItems: number } } }>(
        '/admin-notification',
        { params: qParams }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems);
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
      await Swal.fire('Error!', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  const handleAddClick = (): void => {
    router.push('/dashboard/notification/form');
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
        await axiosInstance.delete(`/admin-notification/${id}`);
        // Trigger a refetch to refresh data
        toast.success('Notification deleted successfully');
        void getNotificationListData();
        setPage(0); // Reset or update the page state if necessary
      } catch (err) {
        await Swal.fire('Failed to delete Notification');
      }
    }
  };

  // Lifecycle hooks
  useEffect(() => {
    void getNotificationListData(); // Ignore the warning
  }, [getNotificationListData]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Notification
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
      <Card>
        <Stack sx={{ padding: '30px' }}>
          <NotificationFilters onSearchChange={handleSearchChange} />
        </Stack>

        {loading ? (
          <CustomLoader />
        ) : (
          <NotificationTable
            entries={entries}
            page={page}
            rowsPerPage={rowsPerPage}
            totalEntries={count}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onDelete={handleDelete}
          />
        )}
      </Card>
      <ToastContainer />
    </Stack>
  );
}
