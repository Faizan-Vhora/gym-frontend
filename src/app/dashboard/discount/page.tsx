'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Button, Card, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Plus as PlusIcon, X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react

import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { DiscountFilter } from '@/components/dashboard/discount/discount-filters';
import { DiscountStatus, DiscountTable } from '@/components/dashboard/discount/discount-table';
import type { DiscountEntry } from '@/components/dashboard/discount/discount-table';

export default function DiscountManagementPage(): React.JSX.Element {
  const [discounts, setDiscounts] = React.useState<DiscountEntry[]>([]);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [filterType, setFilterType] = React.useState<string>('All');
  const [search, setSearch] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  interface DiscountItem extends DiscountEntry {
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
        search,
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
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching discounts: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false); // End loading state
    }
  }, [page, rowsPerPage, filterType, search]);

  React.useEffect(() => {
    fetchDiscounts().catch((err: unknown) => {
      // Handle any errors that might occur during the fetch
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message; // Safely access the message property
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
    });
  }, [fetchDiscounts]);

  const handleAddClick = (): void => {
    router.push('/dashboard/discount/form');
  };

  const handleEdit = (id: number): void => {
    router.push(`/dashboard/discount/form?id=${id}`);
  };

  const handleDelete = async (id: number): Promise<void> => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this discount!',
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

  const handleFilterChange = (type: string): void => {
    setFilterType(type);
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
    // Call your search function here, e.g., fetchResults(value);
  };

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      handleSearchChange(value);
    }, 200), // Adjust the debounce delay as needed
    []
  );

  // Effect for cleanup
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Clear search input
  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Discount Management</Typography>
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
      
      {/* Search Field */}
      <Stack sx={{padding:'30px'}}>
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <TextField
            variant="outlined"
            label="Search"
            value={search}
            fullWidth
            onChange={(e) => {
              handleSearchChange(e.target.value);
            }}
            InputProps={{
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <XIcon size={15} /> {/* Adjust size as needed */}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          {/* Discount Filter and Search Components */}
          <DiscountFilter onFilterChange={handleFilterChange} />
        </Grid>
      </Grid>
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
    </Stack>
  );
}
