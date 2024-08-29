'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';
import {
  DiscountEntry,
  DiscountStatus,
  DiscountTable,
  UsageLimit,
} from '@/components/dashboard/discount/discount-table';

export default function DiscountManagementPage(): React.JSX.Element {
  const [discounts, setDiscounts] = React.useState<DiscountEntry[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = React.useState<DiscountEntry[]>([]);
  const [filterType, setFilterType] = React.useState<string>('All');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const router = useRouter();

  React.useEffect(() => {
    axiosInstance
      .get('/discount')
      .then((response) => setDiscounts(response.data.data.items))
      .catch((error) => console.error('Error fetching discounts:', error));
  }, []);

  React.useEffect(() => {
    setFilteredDiscounts(
      filterType === 'All' ? discounts : discounts.filter((discount) => discount.status === filterType)
    );
  }, [filterType, discounts]);

  const handleAddClick = () => {
    router.push('/dashboard/discount/form');
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/discount/form?id=${id}`);
  };

  const handleDelete = (id: number) => {
    axiosInstance
      .delete(`/discount/${id}`)
      .then(() => {
        setDiscounts(discounts.filter((discount) => discount.id !== id));
      })
      .catch((error) => console.error('Error deleting discount:', error));
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  const handleStatusChange = (id: number, status: DiscountStatus) => {
    setDiscounts(discounts.map((discount) => (discount.id === id ? { ...discount, status } : discount)));
  };

  const handleUsageLimitChange = (id: number, usageLimit: UsageLimit) => {
    setDiscounts(
      discounts.map((discount) => (discount.id === id ? { ...discount, usage_limit: usageLimit } : discount))
    );
  };

  const safeFilteredDiscounts = Array.isArray(filteredDiscounts) ? filteredDiscounts : [];

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
      {/* Discount Filter Component */}
      <DiscountTable
        discounts={safeFilteredDiscounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        totalEntries={safeFilteredDiscounts.length}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onUsageLimitChange={handleUsageLimitChange}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
      />
    </Stack>
  );
}
