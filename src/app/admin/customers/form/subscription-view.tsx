'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
// import DateRangeFilter from '@/components/admin/reports/common-filters/date-range-filter';
import CommonTablePagination from '@/components/admin/reports/common-filters/pagination';
import { SearchFilter } from '@/components/admin/reports/common-filters/seach-filter';
import { Subscription } from '@/components/admin/reports/subscription-report/subscription-report-table';
import { SubscriptionManagementTable } from '@/components/admin/subscriptions/subscription-table';

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
  const router = useRouter();

  const [data, setData] = useState<Subscription[]>(initialSubscription);

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
        userId?: string | null;
      }

      const params: SubscriptionReportQueryI = {
        page: currentPage + 1, // Adjust for API pagination
        limit: itemsPerPage,
        search: search,
        userId: searchParams.get('id'),
      };

      //   if (membershipFilter) {
      //     params.membershipTypeId = membershipFilter !== 'ALL' ? membershipFilter : undefined;
      //   }

      //   if (SubscriptionId) {
      //     params.membershipTypeId = SubscriptionId;
      //   }

      const response = await axiosInstance.get<ApiResponse>('/users/membership-history/list', { params });
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
    const id = searchParams.get('id');
    router.push(`/admin/customers/form?id=${id}&tab=4&${queryString}`);
  };

  useEffect(() => {
    void fetchSubscriptionPlans();
  }, [currentPage, itemsPerPage, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const handleDownload = async (id: number): Promise<void> => {
    const swalText = `Do you want to download this subscription's details?`;
    const swalConfirmButtonText = `Yes, download it!`;
    const swalSuccessMessage = `The subscription details have been downloaded`;

    // Show a confirmation popup with SweetAlert
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: swalText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'No',
    });

    // If confirmed, proceed to download
    if (result.isConfirmed) {
      try {
        // Make the API call to download the booking details (replace with actual API endpoint)
        const response = await axiosInstance.get(`/users/download-membership/${id}`, {
          responseType: 'blob', // Ensures the response is treated as a file
        });

        // Create a Blob from the response data and trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `subscription-${id}-details.pdf`; // Set the filename for download
        link.click();

        // Optionally, show a success message
        await Swal.fire('Downloaded!', swalSuccessMessage, 'success');
      } catch (error) {
        await Swal.fire('Error!', 'Failed to download the subscription details.', 'error');
      }
    }
  };

  //   const handleMembershipTypeChange = (membershipType: string): void => {
  //     setMembershipFilter(membershipType);
  //     setCurrentPage(0);
  //   };

  //   const handleUpdateStatus = async (id: number, newStatus: MembershipType['status']): Promise<void> => {
  //     let swalText = `Do you want to change the status?`;
  //     let swalConfirmButtonText = `Yes, update it!`;
  //     let swalSuccessMessage = `The status has been updated`;

  //     if (newStatus === MEMBERSHIP_PLAN_STATUS.CANCEL) {
  //       swalText = `Do you want to cancel the subscription?`;
  //       swalConfirmButtonText = `Yes`;
  //       swalSuccessMessage = `The subscription has been cancelled`;
  //     }

  //     const result = await Swal.fire({
  //       title: 'Are you sure?',
  //       text: swalText,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: swalConfirmButtonText,
  //       cancelButtonText: 'No',
  //     });

  //     if (result.isConfirmed) {
  //       try {
  //         await axiosInstance.patch(`/users/membership/update-status/${id}`, { status: newStatus });
  //         void fetchSubscriptionPlans();
  //         setData((prevData) => {
  //           return prevData.map((item) => {
  //             if (item.id === id) {
  //               return { ...item, status: newStatus }; // Update the specific item's status
  //             }
  //             return item; // Return the item as is if it's not the one being updated
  //           });
  //         });
  //         toast.success(swalSuccessMessage);
  //       } catch (error) {
  //         await Swal.fire('Error!', 'Failed to update.', 'error');
  //       }
  //     }
  //   };

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          {/* <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Subscriptions
          </Typography> */}
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <SearchFilter onSearchChange={handleSearchChange} />
            </Grid>
            {/* <Grid item md={4} xs={12}>
              <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} />
            </Grid> */}
            {/* <Grid item md={4} xs={12}>
              <SubscriptionFilters onMembershipTypeChange={handleMembershipTypeChange} />
            </Grid> */}
          </Grid>
        </Stack>

        <Stack sx={{ padding: '30px' }}></Stack>

        {loading ? <CustomLoader /> : <SubscriptionManagementTable rows={data} onDownload={handleDownload} />}
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
