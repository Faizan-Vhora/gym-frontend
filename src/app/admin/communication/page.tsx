'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, Grid, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { CommunicationFilters } from '@/components/admin/communication/notification-filter';
import { CommunicationTable, NotificationEntry } from '@/components/admin/communication/notification-table';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State variables
  const [entries, setEntries] = React.useState<NotificationEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [page, setPage] = React.useState<number>(searchParams.get('page') ? Number(searchParams.get('page')) : 0);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    searchParams.get('rowsPerPage') ? Number(searchParams.get('rowsPerPage')) : 10
  );
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
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    updateUrlPathQueryParams();
  }, [searchTerm, page, rowsPerPage]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: searchTerm,
      page: String(page),
      rowsPerPage: String(rowsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/communication?${queryString}`);
  };

  const handleAddClick = (): void => {
    router.push('/admin/communication/form');
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
            Communication
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
          <Grid container spacing={2}>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              <CommunicationFilters onSearchChange={handleSearchChange} />
            </Grid>
          </Grid>
        </Stack>

        {loading ? (
          <CustomLoader />
        ) : (
          <CommunicationTable
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
