'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Stack } from '@mui/material';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import {
  OutstandingBilling,
  OutstandingBillingTable,
} from '@/components/admin/outstanding-billing/outstanding-billing-table';
import CommonTablePagination from '@/components/admin/reports/common-filters/pagination';
import { SearchFilter } from '@/components/admin/reports/common-filters/seach-filter';

interface ErrorResponse {
  message: string;
}
// Define ApiResponse interface for the expected API response structure
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    items: OutstandingBilling[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
  errors: ErrorResponse;
}

const initialOutstandingBilling: OutstandingBilling[] = [];

export default function OutstandingBillingPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<OutstandingBilling[]>(initialOutstandingBilling);

  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState<number>(
    searchParams.get('page') ? Number(searchParams.get('page')) : 0
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    searchParams.get('rowsPerPage') ? Number(searchParams.get('rowsPerPage')) : 10
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  //   const [membershipFilter, setMembershipFilter] = useState<string>(searchParams.get('membershipId') || 'ALL'); // Membership type filter

  // Function to fetch data
  const fetchSubscriptionPlans = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      interface SubscriptionReportQueryI {
        page: number;
        limit: number;
        search?: string | null;
        membershipTypeId?: string | null;
      }

      const params: SubscriptionReportQueryI = {
        page: currentPage + 1, // Adjust for API pagination
        limit: itemsPerPage,
        search: search,
        membershipTypeId: null,
      };

      const response = await axiosInstance.get<ApiResponse>('/users/membership/list', { params });
      const { items, meta } = response.data.data;

      if (Array.isArray(items)) {
        setData(items);
        setTotalItems(meta.totalItems);
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]); // Add dependencies here

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [search, currentPage, itemsPerPage]);

  const updateUrlPathQueryParams = () => {
    const pathQueryParams = {
      search: search,
      page: String(currentPage),
      rowsPerPage: String(itemsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/customers/form?id=${searchParams.get('id')}&tab=5&${queryString}`);
  };

  useEffect(() => {
    void fetchSubscriptionPlans();
  }, [currentPage, itemsPerPage, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <SearchFilter onSearchChange={handleSearchChange} />
            </Grid>
          </Grid>
        </Stack>

        <Stack sx={{ padding: '30px' }}></Stack>

        {loading ? <CustomLoader /> : <OutstandingBillingTable rows={data} />}
        {data.length > 0 && (
          <>
            <Divider />
            <CommonTablePagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(event, newPage) => {
                setCurrentPage(newPage);
              }}
              onRowsPerPageChange={(event) => {
                setItemsPerPage(parseInt(event.target.value, 10));
              }}
            />
          </>
        )}
      </Card>
    </>
  );
}
