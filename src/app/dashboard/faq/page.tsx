'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { FaqFilters } from '@/components/dashboard/faq/faq-filters';
import FaqTable from '@/components/dashboard/faq/faq-tables';
import type { FaqEntry, FaqStatus } from '@/components/dashboard/faq/faq-tables';

import 'react-toastify/dist/ReactToastify.css';

import { CustomLoader } from '@/utils/loader';
import Swal from 'sweetalert2';

const initialFaqs: FaqEntry[] = [];

export default function FaqManagementPage(): React.JSX.Element {
  const [faqs, setFaqs] = React.useState<FaqEntry[]>(initialFaqs);
  const [page, setPage] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [filterType, setFilterType] = React.useState<string>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface FaqResponseData {
    data: {
      items: FaqEntry[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  const fetchFaqs = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = {
        page: page + 1, // Adjusted to match typical API's 1-based page indexing
        limit: rowsPerPage,
        search: searchTerm, // Search term
        type: filterType !== 'ALL' ? filterType : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      };

      const response = await axiosInstance.get<FaqResponseData>('/faq', { params });

      const { items, meta } = response.data.data;
      if (Array.isArray(items)) {
        setFaqs(items); // `items` is of type `FaqEntry[]`
        setTotalItems(meta.totalItems); // `meta.totalItems` is of type `number`
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
        setError('Unexpected data format.');
      }
    } catch (err) {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching FAQs: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterType, filterStatus]);

  React.useEffect(() => {
    const loadFaqs = async (): Promise<void> => {
      try {
        await fetchFaqs();
      } catch (err: unknown) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching FAQs: ${err.message}`;
        }
        toast.error(errorMessage);
      }
    };

    // Immediately invoke the async function and handle the promise
    loadFaqs().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching FAQs: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, [fetchFaqs]);

  const handleAddClick = (): void => {
    router.push('/dashboard/faq/form');
  };

  const handleEdit = (id: number): void => {
    router.push(`/dashboard/faq/form?id=${id}`);
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this FAQ. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      // If confirmed, proceed with deletion
      if (result.isConfirmed) {
        await axiosInstance.delete(`/faq/${id}`);
        await fetchFaqs(); // Refresh FAQ list
        toast.success('FAQ deleted successfully');
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete FAQ.';
      if (err instanceof Error) {
        errorMessage = `Error deleting FAQ: ${err.message}`;
      }
      toast.error(errorMessage);
    }
  };

  const handleSearchChange = (search: string): void => {
    setSearchTerm(search);
  };

  const handleStatusChange = async (id: number, status: FaqStatus): Promise<void> => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${status} this FAQ.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${status} it!`,
    });

    // If confirmed, proceed with the status update
    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/faq/update-status/${id}`, { status: status });
        setFaqs((prevFaqs) => prevFaqs.map((faq) => (faq.id === id ? { ...faq, status } : faq)));
        toast.success('Status updated successfully');
      } catch (err: unknown) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching FAQ: ${err.message}`;
        }
        toast.error(errorMessage);
      }
    }
  };

  const handleTypeChange = (type: string): void => {
    setFilterType(type);
    setPage(0); // Reset page when filter type changes
  };

  const handleStatusChangeFilter = (status: string): void => {
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
          className="common-button align-items-normal"
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Stack>
      <FaqFilters
        onSearchChange={handleSearchChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChangeFilter}
      />
      {loading ? (
        <CustomLoader />
      ) : (
        <FaqTable
          faqs={faqs}
          page={page}
          rowsPerPage={rowsPerPage}
          totalEntries={totalItems} // Display the total number of entries
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0); // Reset page when rows per page change
          }}
        />
      )}
      {error ? <Alert color="error">{error}</Alert> : null}
      <ToastContainer />
    </Stack>
  );
}
