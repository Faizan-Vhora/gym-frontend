'use client';

import React, { useEffect, useState } from 'react';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Stack, Typography } from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro';
import { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import { CheckInEntry } from '@/components/admin/check-in/check-in-table';
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
  const [data, setData] = useState<CheckInEntry[]>([]);

  const [search, setSearch] = React.useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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
        }

        const params: CheckInReportQueryI = {
          page: currentPage + 1, // Adjust for API pagination
          limit: itemsPerPage,
          search: search,
          startDate: null,
          endDate: null,
        };

        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }

        const response = await axiosInstance.get<ApiResponse>('/entry-logs', { params });
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
  }, [currentPage, itemsPerPage, search, startDate, endDate]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const handleDateChange = (dateRangeS: DateRange<Dayjs>) => {
    setDateRange(dateRangeS);
    const [start, end] = dateRangeS;
    setStartDate(start?.format('YYYY-MM-DD') || null);
    setEndDate(end?.format('YYYY-MM-DD') || null);
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
          </Grid>
        </Stack>

        <Stack sx={{ padding: '30px' }}></Stack>

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
