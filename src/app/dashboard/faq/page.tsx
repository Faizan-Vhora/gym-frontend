'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';
import { FaqFilters } from '@/components/dashboard/faq/faq-filters';
import FaqTable, { FaqEntry, FaqStatus } from '@/components/dashboard/faq/faq-tables';

const initialFaqs: FaqEntry[] = [];

export default function FaqManagementPage(): React.JSX.Element {
  const [faqs, setFaqs] = React.useState<FaqEntry[]>(initialFaqs);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [filterType, setFilterType] = React.useState<string>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');

  const router = useRouter();

  const fetchFaqs = React.useCallback(() => {
    const params = {
      page: page + 1, // API page usually starts from 1, adjust if necessary
      limit: rowsPerPage,
      type: filterType !== 'ALL' ? filterType : undefined,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
    };

    axiosInstance
      .get('/faq', { params })
      .then((response) => {
        setFaqs(response.data.data.items);
      })
      .catch((error) => console.error('Error fetching FAQs:', error));
  }, [page, rowsPerPage, filterType, filterStatus]);

  React.useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleAddClick = () => {
    router.push('/dashboard/faq/form');
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/faq/form?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/faq/${id}`);
      fetchFaqs(); // Refresh the FAQ list after deletion
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleStatusChange = (id: number, status: FaqStatus) => {
    setFaqs((prevFaqs) => prevFaqs.map((faq) => (faq.id === id ? { ...faq, status } : faq)));
  };

  const handleTypeChange = (type: string) => {
    setFilterType(type);
    setPage(0); // Reset page when filter type changes
  };

  const handleStatusChangeFilter = (status: string) => {
    setFilterStatus(status);
    setPage(0); // Reset page when filter status changes
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">FAQ Management</Typography>
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

      <FaqFilters onTypeChange={handleTypeChange} onStatusChange={handleStatusChangeFilter} />

      <FaqTable
        faqs={faqs}
        page={page}
        rowsPerPage={rowsPerPage}
        totalEntries={faqs.length} // Replace with total entries from API if available
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
      />
    </Stack>
  );
}
