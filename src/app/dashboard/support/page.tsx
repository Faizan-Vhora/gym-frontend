'use client';

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { CustomLoader } from '@/utils/loader';
import {
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { SupportEntry, SupportTable } from '@/components/dashboard/support/support-table';
import { SupportFilters } from '@/components/dashboard/support/support-filters';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';


export default function Page(): React.JSX.Element {

  const router = useRouter();

  // <variables> (start)

  const [pageTitle, setPageTitle] = React.useState('Support');
  const [entries, setEntries] = React.useState<SupportEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [fromFilter, setFromFilter] = React.useState('All');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  // <variables> (end)



  // < methods> (start)

  const getSupportListData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {

      const qParams = {
        page: page + 1,
        limit: rowsPerPage, // Number of rows per page
        search: searchTerm, // Search term
        userType: fromFilter !== 'All' ? fromFilter : null, // From filter
        status: statusFilter !== 'All' ? statusFilter : null, // Status filter
      }

      const response = await axiosInstance.get<{ data: { items: SupportEntry[]; meta: { totalItems: number } } }>(
        '/support-ticket',
        {
          params: {
            ...qParams
          },
        }
      );

      setEntries(response.data.data.items);
      setCount(response.data.data.meta.totalItems); // Total number of items for pagination controls
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, fromFilter]);


  const handleAddClick = (): void => {
    router.push('/dashboard/support/form');
  };

  const handleUpdateStatus = async (id: number, newStatus: SupportEntry['status']): Promise<void> => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the status?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/support-ticket/update-status/${id}`, { status: newStatus });
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
        );
        Swal.fire('Updated!', 'The status has been updated.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to update status.', 'error');
        if (process.env.NODE_ENV !== 'production') {
          // console.error('Failed to update status:', error);
        }
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
  // <methods hooks> (end)


  // <lifecycle hooks> (start)
  useEffect(() => {
    void getSupportListData();
  }, [getSupportListData]);
  // <lifecycle hooks> (end)


  // <template> (start)

  return (

    <Stack spacing={3}>
    <Stack direction="row" spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
          {pageTitle}
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

  // <template> (end)

}
