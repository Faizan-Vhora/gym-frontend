'use client';

import React, { useEffect, useState } from 'react';
import { formatAmount, formatHours } from '@/utils/converter';
import { getStatusText, UserStatus } from '@/utils/userstatus';
import {
  Card,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro';
import { Barbell, Equals, Flag, XCircle } from '@phosphor-icons/react';
import { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import DateRangeFilter from '@/components/admin/reports/common-filters/date-range-filter';
import CommonTablePagination from '@/components/admin/reports/common-filters/pagination'; // Adjust the import path as necessary

import { SearchFilter } from '@/components/admin/reports/common-filters/seach-filter';
import { TrainerStatusFilters } from '@/components/admin/reports/trainer-report/trainer-status-filter';
import { Trainer } from '@/components/admin/trainer/trainer-table';
import tableCss from '@/styles/table-css';

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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableCss.tableHeaderCell}>Trainer</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Contact Details</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Fees</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Attendance</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Session Counts</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Session Hours</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Session Revenue</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow sx={tableCss.tableRow}>
                    <TableCell colSpan={7} align="center">
                      {' '}
                      {/* Corrected colSpan to 7 to match the number of columns */}
                      <Typography variant="body1">No data found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map(
                    (
                      trainer // Removed curly braces around the map
                    ) => (
                      <TableRow key={trainer.id} sx={tableCss.tableRow}>
                        <TableCell sx={tableCss.tableCell}>
                          <Typography variant="subtitle2">{trainer.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer?.trainerExpertise
                              ?.map((expertiseItem) => expertiseItem.expertise?.title)
                              .filter((title) => title && title !== '')
                              .join(', ')}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer.experience ? (
                              <>
                                <Barbell /> {trainer.experience} years
                              </>
                            ) : null}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{trainer.email}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer.phoneNumber}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCss.tableCell}>{formatAmount(trainer.fees)} Per Hour</TableCell>
                        <TableCell sx={tableCss.tableCell}>
                          <Typography variant="body2">
                            {trainer.attendanceDetail ? `Available Days : ${trainer.attendanceDetail?.available}` : ''}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer.attendanceDetail ? `On Leave : ${trainer.attendanceDetail?.unAvailable}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCss.tableCell}>
                          <Typography variant="body2">
                            {trainer.sessionDetail ? `Total: ${trainer.sessionDetail.totalSession}` : null}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer.sessionDetail ? `Completed: ${trainer.sessionDetail.completedSession}` : null}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {trainer.sessionDetail ? `Cancelled: ${trainer.sessionDetail.cancelledSession}` : null}
                            {/* {trainer.sessionDetail ? `Cancelled : ${trainer.sessionDetail.cancelledSession}` : ''} */}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCss.tableCell}>
                          {trainer.sessionDetail ? formatHours(trainer.sessionDetail.sessionTotalHours) : ''}
                        </TableCell>
                        <TableCell sx={tableCss.tableCell}>
                          {trainer.sessionDetail ? formatAmount(trainer.sessionDetail?.sessionTotalRevenue) : ''}
                        </TableCell>
                        <TableCell sx={tableCss.tableCell}>
                          <FormControlLabel
                            control={
                              <Chip
                                label={getStatusText(trainer.status === UserStatus.Active ? 1 : 2)}
                                color={trainer.status === UserStatus.Active ? 'success' : 'error'}
                                variant="filled"
                              />
                            }
                            label=""
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
