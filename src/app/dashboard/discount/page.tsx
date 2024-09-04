'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { DiscountFilter } from '@/components/dashboard/discount/discount-filters';
import { DiscountTable } from '@/components/dashboard/discount/discount-table';
import type { DiscountEntry, DiscountStatus } from '@/components/dashboard/discount/discount-table';

export default function DiscountManagementPage(): React.JSX.Element {
  const [discounts, setDiscounts] = React.useState<DiscountEntry[]>([]);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [filterType, setFilterType] = React.useState<string>('All');
  const [search, setSearch] = React.useState<string>('');
  const router = useRouter();

  interface DiscountItem extends DiscountEntry {
    // If DiscountItem should extend DiscountEntry, you can use inheritance
  }

  interface FetchDiscountsResponse {
    data: {
      items: DiscountItem[];
      meta: {
        totalItems: number;
      };
    };
  }

  const fetchDiscounts = React.useCallback((): void => {
    axiosInstance
      .get<FetchDiscountsResponse>('/discount', {
        params: {
          page: page + 1, // API pages are often 1-indexed
          limit: rowsPerPage,
          status: filterType !== 'All' ? filterType : undefined,
          search,
        },
      })
      .then((response) => {
        setDiscounts(response.data.data.items);
        setTotalItems(response.data.data.meta.totalItems);
      })
      .catch((error: unknown) => {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      });
  }, [page, rowsPerPage, filterType, search]);

  React.useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleAddClick = (): void => {
    router.push('/dashboard/discount/form');
  };

  const handleEdit = (id: number): void => {
    router.push(`/dashboard/discount/form?id=${id}`);
  };

  const handleDelete = (id: number): void => {
    axiosInstance
      .delete(`/discount/${id}`)
      .then(() => {
        fetchDiscounts();
      })
      .catch((error: unknown) => {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      });
  };

  const handleStatusChange = (id: number, status: DiscountStatus): void => {
    axiosInstance
      .patch(`/discount/update-status/${id}`, { status })
      .then(() => {
        fetchDiscounts();
      })
      .catch((error: unknown) => {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      });
  };

  const handleFilterChange = (type: string): void => {
    setFilterType(type);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
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
      {/* Search Field */}
      <Grid container spacing={2}>
        <Grid className="input-width" item md={6} xs={12}>
          <TextField variant="outlined" label="Search" value={search} fullWidth onChange={handleSearchChange} />
        </Grid>
        <Grid item md={6} xs={12}>
          {/* Discount Filter and Search Components */}
          <DiscountFilter onFilterChange={handleFilterChange} />
        </Grid>
      </Grid>
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
    </Stack>
  );
}
