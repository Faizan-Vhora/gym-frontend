'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Stack, Typography } from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { CheckInEntry } from '@/components/admin/check-in/check-in-table';
import TimeFilter from '@/components/admin/reports/checkin-report/checkin-filter';
import { CheckInReportTable } from '@/components/admin/reports/checkin-report/checkin-report-table';
import DateRangeFilter from '@/components/admin/reports/common-filters/date-range-filter';
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
    items: CheckInEntry[];
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

const CheckInReport: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CheckInEntry[]>([]);

  const [search, setSearch] = React.useState<string>(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const rawDateRange = searchParams.get('dateRange');
  const [start, end] = rawDateRange ? rawDateRange.split(',') : [null, null];
  const initialDateRange: DateRange<Dayjs> = [start ? dayjs(start) : null, end ? dayjs(end) : null];
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>(initialDateRange);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  // Add state variables for time filters
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const { control } = useForm();

  // Function to fetch data
  useEffect(() => {
    const fetchCheckinReports = async (): Promise<void> => {
      setLoading(true);
      try {
        interface CheckInReportQueryI {
          page: number;
          limit: number;
          search?: string | null;
          startDate?: string | null;
          endDate?: string | null;
          startTime?: string | null;
          endTime?: string | null;
        }

        const params: CheckInReportQueryI = {
          page: currentPage + 1, // Adjust for API pagination
          limit: itemsPerPage,
          search: search,
          startDate: null,
          endDate: null,
          startTime: checkInTime,
          endTime: checkOutTime,
        };

        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }

        const response = await axiosInstance.get<ApiResponse>('/report/user-check-in-report', { params });
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
        err instanceof Error ? err.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchCheckinReports();
  }, [currentPage, itemsPerPage, search, dateRange, checkInTime, checkOutTime]);

  React.useEffect(() => {
    updateUrlPathQueryParams();
  }, [search, currentPage, itemsPerPage, dateRange]);

  const updateUrlPathQueryParams = () => {
    const formattedDateRange =
      dateRange[0] && dateRange[1] ? `${dateRange[0].toISOString()},${dateRange[1].toISOString()}` : ''; // Converts dateRange to a string if both dates are present
    const pathQueryParams = {
      search: search,
      dateRange: formattedDateRange,
      page: String(currentPage),
      rowsPerPage: String(itemsPerPage),
    };

    // Construct the query string using URLSearchParams
    const queryString = new URLSearchParams(pathQueryParams).toString();

    // Use router.push with the constructed query string
    router.push(`/admin/reports/checkin-report?${queryString}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const handleDateChange = (dateRangeS: DateRange<Dayjs>) => {
    setDateRange(dateRangeS);
    const [starts, ends] = dateRangeS;
    setStartDate(starts?.format('YYYY-MM-DD') || null);
    setEndDate(ends?.format('YYYY-MM-DD') || null);
  };

  const handleTimeChange = (time: Date | null, isCheckIn: boolean) => {
    if (time) {
      const formattedTime = dayjs(time).format('HH:mm:ss'); // Format time as needed
      if (isCheckIn) {
        setCheckInTime(formattedTime); // Set check-in time
      } else {
        setCheckOutTime(formattedTime); // Set check-out time
      }
    } else {
      // Handle the case when time is cleared
      if (isCheckIn) {
        setCheckInTime(null);
      } else {
        setCheckOutTime(null);
      }
    }
  };

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Check In Report
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <SearchFilter onSearchChange={handleSearchChange} />
            </Grid>
            <Grid item md={4} xs={12}>
              <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} />
            </Grid>
            <Grid item md={4} xs={12}>
              <Grid container spacing={2}>
                <Grid item md={6}>
                  <TimeFilter
                    label="CheckIn"
                    name="checkInTime"
                    control={control}
                    onTimeChange={(time) => {
                      handleTimeChange(time, true);
                    }} // Pass true for check-in
                  />
                </Grid>
                <Grid item md={6}>
                  <TimeFilter
                    label="CheckOut"
                    name="checkOutTime"
                    control={control}
                    onTimeChange={(time) => {
                      handleTimeChange(time, false);
                    }} // Pass false for check-out
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Stack>

        {/* <Stack sx={{ padding: '30px' }}></Stack> */}

        {loading ? <CustomLoader /> : <CheckInReportTable rows={data} />}
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
};

export default CheckInReport;
