'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react

import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { DiscountFilter } from '@/components/admin/discount/discount-filters';
import { DiscountStatus, DiscountTable } from '@/components/admin/discount/discount-table';
import type { DiscountEntryResponse } from '@/components/admin/discount/discount-table';

export default function DiscountManagementPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [discounts, setDiscounts] = React.useState<DiscountEntryResponse[]>([]);
  const [page, setPage] = React.useState<number>(searchParams.get('page') ? Number(searchParams.get('page')) : 0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(
    searchParams.get('rowsPerPage') ? Number(searchParams.get('rowsPerPage')) : 10
  );
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [filterType, setFilterType] = React.useState<string>(searchParams.get('status') || 'All');
  const [search, setSearch] = React.useState<string>(searchParams.get('search') || '');
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  interface DiscountItem extends DiscountEntryResponse {
    // If DiscountItem should extend DiscountEntry, you can use inheritance
  }

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }
  interface FetchDiscountsResponse {
    data: {
      items: DiscountItem[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  const fetchDiscounts = React.useCallback(async (): Promise<void> => {
    setLoading(true); // Start loading state
    try {
      const params = {
        page: page + 1, // Adjust for API pagination
        limit: rowsPerPage,
        status: filterType !== 'All' ? filterType : undefined,
        search: search,
      };

      const response = await axiosInstance.get<FetchDiscountsResponse>('/discount', { params });
      const { items, meta } = response.data.data;

      if (Array.isArray(items)) {
        setDiscounts(items);
        setTotalItems(meta.totalItems);
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
      }
    } catch (err) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false); // End loading state
    }
  }, [page, rowsPerPage, filterType, search]);

  React.useEffect(() => {
    fetchDiscounts().catch((err: unknown) => {
      // Handle any errors that might occur during the fetch
      err instanceof Error ? err.message : 'An unexpected error occurred';
    });
  }, [fetchDiscounts]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [search, filterType, page, rowsPerPage]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: search,
      status: filterType,
      page: String(page),
      rowsPerPage: String(rowsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/discount?${queryString}`);
  };

  const handleAddClick = (): void => {
    router.push('/admin/discount/form');
  };

  const handleEdit = (id: number): void => {
    router.push(`/admin/discount/form?id=${id}`);
  };

  const handleDelete = async (id: number): Promise<void> => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        // Proceed with deletion if confirmed
        await axiosInstance.delete(`/discount/${id}`);
        // Swal.fire('Deleted!', 'The discount has been deleted.', 'success');
        await fetchDiscounts(); // Refresh the discount list
      } catch (error: unknown) {
        // let errorMessage: string;
        // if (typeof error === 'string') {
        //   errorMessage = error;
        // } else {
        //   errorMessage = 'An unexpected error occurred';
        // }
        // Swal.fire('Error', errorMessage, 'error'); // Show error alert
      }
    }
  };

  const handleStatusChange = async (id: number, status: DiscountStatus): Promise<void> => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${status === DiscountStatus.Active ? 'activate' : 'deactivate'} this discount?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        // Proceed with status change if confirmed
        await axiosInstance.patch(`/discount/update-status/${id}`, { status });
        // Swal.fire('Updated!', 'The discount status has been changed.', 'success');
        await fetchDiscounts(); // Refresh the list
      } catch (error: unknown) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      }
    }
  };

  const handleFilterChange = (type: string): void => {
    setFilterType(type);
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
    // Call your search function here, e.g., fetchResults(value);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
            Discount Management
          </Typography>
        </Stack>
        <Button
          className="common-button"
          style={{ fontFamily: 'Audiowide, sans-serif' }}
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Stack>
      <Card>
        {/* Discount Filter and Search Components */}
        <Stack sx={{ padding: '30px' }}>
          <DiscountFilter onSearchChange={handleSearchChange} onStatusChange={handleFilterChange} />
        </Stack>
        {loading ? (
          <CustomLoader />
        ) : (
          <DiscountTable
            discounts={discounts}
            page={page}
            rowsPerPage={rowsPerPage}
            totalEntries={totalItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
          />
        )}
      </Card>
      <ToastContainer />
    </Stack>
  );
}
