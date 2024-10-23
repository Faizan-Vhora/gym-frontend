'use client';

import React, { useEffect, useState } from 'react';
import { CustomLoader } from '@/utils/loader';
import { Card, Divider, Grid, Paper, Stack, TableContainer, Typography } from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro';
import { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import DateRangeFilter from '@/components/admin/reports/common-filters/date-range-filter';
import CommonTablePagination from '@/components/admin/reports/common-filters/pagination'; // Adjust the import path as necessary

import { SearchFilter } from '@/components/admin/reports/common-filters/seach-filter';
import { TrainerReportTable } from '@/components/admin/reports/trainer-report/trainer-report-table';
import { TrainerStatusFilters } from '@/components/admin/reports/trainer-report/trainer-status-filter';
import { Trainer } from '@/components/admin/trainer/trainer-table';

// Define Trainer interface to specify the structure of trainer data
interface ErrorResponse {
  message: string;
}

// Define ApiResponse interface for the expected API response structure
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Trainer[];
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

const TrainerReport: React.FC = () => {
  const [data, setData] = useState<Trainer[]>([]);

  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = React.useState(false);

  // Function to fetch data

  useEffect(() => {
    const fetchTrainerReports = async (): Promise<void> => {
      try {
        interface TrainerReportQueryI {
          page: number;
          limit: number;
          search?: string | null;
          startDate?: string | null;
          endDate?: string | null;
          status?: string | null;
        }

        const params: TrainerReportQueryI = {
          page: currentPage + 1, // Adjust for API pagination
          limit: itemsPerPage,
          search: search,
          startDate: null,
          endDate: null,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        };

        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>('/report/trainer-report', { params });
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
    };

    void fetchTrainerReports();
  }, [currentPage, itemsPerPage, search, startDate, endDate, statusFilter]);

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

  const handleStatusChange: (status: string) => void = (status) => {
    setStatusFilter(status);
  };

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Trainer Report
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <SearchFilter onSearchChange={handleSearchChange} />
            </Grid>
            <Grid item md={4} xs={12}>
              <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} />
            </Grid>
            <Grid item md={4} xs={12}>
              <TrainerStatusFilters onStatusChange={handleStatusChange} />
            </Grid>
          </Grid>
        </Stack>

        <Paper>
          <TableContainer>{loading ? <CustomLoader /> : <TrainerReportTable rows={data} />}</TableContainer>
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
        </Paper>
      </Card>
    </>
  );
};

export default TrainerReport;
