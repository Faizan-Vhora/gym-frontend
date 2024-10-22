'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { ServiceFilters } from '@/components/admin/services/service-filters';
import { ServicesTable, type Services } from '@/components/admin/services/service-table';

import 'react-toastify/dist/ReactToastify.css';

const initialServices: Services[] = []; // Initialize with an empty array

export default function ServiceManagementPage(): React.JSX.Element {
  const [servicesS, setServices] = React.useState<Services[]>(initialServices);
  const [page, setPage] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const router = useRouter();

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface ServicesResponseData {
    data: {
      items: Services[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  const fetchServices = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = {
        page: page + 1, // Adjusted to match typical API's 1-based page indexing
        limit: rowsPerPage,
        search: searchTerm, // Search term
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      };

      const response = await axiosInstance.get<ServicesResponseData>('/service-management', { params });

      const { items, meta } = response.data.data;
      if (Array.isArray(items)) {
        setServices(items);
        setTotalItems(meta.totalItems);
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
        setError('Unexpected data format.');
      }
    } catch (err) {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching services: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterStatus]);

  React.useEffect(() => {
    fetchServices().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching services: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, [fetchServices]);

  const handleAddClick = (): void => {
    router.push('/admin/services/form');
  };

  const handleSearchChange = (search: string): void => {
    setSearchTerm(search);
  };

  const updatePlanStatus = async (id: string, currentStatus: string): Promise<void> => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'; // Toggle status
    try {
      await axiosInstance.patch(`/service-management/update-status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
      await fetchServices(); // Refresh Services data
    } catch (err: unknown) {
      let errorMessage: string;
      if (typeof err === 'string') {
        errorMessage = err;
      } else {
        // Handle other types of errors, or set a generic message
        errorMessage = 'An unexpected error occurred';
      }
      // Convert the Error object to a string
      toast.error(errorMessage);
    }
  };

  const handleStatusChangeFilter = (status: string): void => {
    setFilterStatus(status);
    setPage(0); // Reset page when filter status changes
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Service Management</Typography>
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
      <ServiceFilters onSearchChange={handleSearchChange} onStatusChange={handleStatusChangeFilter} />
      {loading ? (
        <CustomLoader />
      ) : (
        <ServicesTable
          services={servicesS}
          count={totalItems}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10)); // Ensure conversion to a number
            setPage(0); // Reset page when rows per page change
          }}
          updateServiceStatus={updatePlanStatus}
        />
      )}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <ToastContainer />
    </Stack>
  );
}
