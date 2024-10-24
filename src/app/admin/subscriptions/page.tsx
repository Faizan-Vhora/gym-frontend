'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MEMBERSHIP_PLAN_STATUS } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
// import DateRangeFilter from '@/components/admin/reports/common-filters/date-range-filter';
import CommonTablePagination from '@/components/admin/reports/common-filters/pagination';
import { SearchFilter } from '@/components/admin/reports/common-filters/seach-filter';
import { SubscriptionFilters } from '@/components/admin/reports/subscription-report/subscription-filter';
import { Subscription } from '@/components/admin/reports/subscription-report/subscription-report-table';
import { MembershipType, SubscriptionManagementTable } from '@/components/admin/subscriptions/subscription-table';

interface ErrorResponse {
  message: string;
}
// Define ApiResponse interface for the expected API response structure
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Subscription[];
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

const initialSubscription: Subscription[] = [];

export default function SubscriptionManagementPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const SubscriptionId = searchParams.get('membershipTypeId');

  const [data, setData] = useState<Subscription[]>(initialSubscription);

  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState<string>('ALL'); // Membership type filter

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

      if (membershipFilter) {
        params.membershipTypeId = membershipFilter !== 'ALL' ? membershipFilter : undefined;
      }

      if (SubscriptionId) {
        params.membershipTypeId = SubscriptionId;
      }

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
  }, [currentPage, itemsPerPage, search, membershipFilter, SubscriptionId]); // Add dependencies here

  useEffect(() => {
    void fetchSubscriptionPlans();
  }, [currentPage, itemsPerPage, search, membershipFilter, SubscriptionId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const handleMembershipTypeChange = (membershipType: string): void => {
    setMembershipFilter(membershipType);
    setCurrentPage(0);
  };

  const handleUpdateStatus = async (id: number, newStatus: MembershipType['status']): Promise<void> => {
    let swalText = `Do you want to change the status?`;
    let swalConfirmButtonText = `Yes, update it!`;
    let swalSuccessMessage = `The status has been updated`;

    if (newStatus === MEMBERSHIP_PLAN_STATUS.CANCEL) {
      swalText = `Do you want to cancel the subscription?`;
      swalConfirmButtonText = `Yes`;
      swalSuccessMessage = `The subscription has been cancelled`;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(`/users/membership/update-status/${id}`, { status: newStatus });
        void fetchSubscriptionPlans();
        setData((prevData) => {
          return prevData.map((item) => {
            if (item.id === id) {
              return { ...item, status: newStatus }; // Update the specific item's status
            }
            return item; // Return the item as is if it's not the one being updated
          });
        });
        toast.success(swalSuccessMessage);
      } catch (error) {
        await Swal.fire('Error!', 'Failed to update.', 'error');
      }
    }
  };

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Subscriptions
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <SearchFilter onSearchChange={handleSearchChange} />
            </Grid>
            {/* <Grid item md={4} xs={12}>
              <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} />
            </Grid> */}
            <Grid item md={4} xs={12}>
              <SubscriptionFilters onMembershipTypeChange={handleMembershipTypeChange} />
            </Grid>
          </Grid>
        </Stack>

        <Stack sx={{ padding: '30px' }}></Stack>

        {loading ? <CustomLoader /> : <SubscriptionManagementTable onUpdateStatus={handleUpdateStatus} rows={data} />}
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
