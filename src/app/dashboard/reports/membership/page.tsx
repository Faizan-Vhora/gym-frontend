'use client';

import React, { useEffect, useState } from 'react';
import { formatAmount, formatHours } from '@/utils/converter';
import { CustomLoader } from '@/utils/loader';
import {
  Card,
  Divider,
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
import { Barbell } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import CommonTablePagination from '@/components/dashboard/reports/pagination'; // Adjust the import path as necessary

import { SearchFilter } from '@/components/dashboard/reports/seach-filter';
import { Trainer, TrainerExpertise } from '@/components/dashboard/trainer/trainer-table';
import tableCss from '@/styles/table-css';

// Define Trainer interface to specify the structure of trainer data

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
  errors: {};
}

const MembershipReport: React.FC = () => {
  const [data, setData] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Function to fetch data
  const fetchTrainerReports = React.useCallback(async (): Promise<void> => {
    setLoading(true); // Start loading state
    try {
      const params = {
        page: currentPage + 1, // Adjust for API pagination
        limit: itemsPerPage,
        search: search,
      };

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
      setLoading(false); // End loading state
    }
  }, [currentPage, itemsPerPage, search]);

  React.useEffect(() => {
    fetchTrainerReports().catch((err: unknown) => {
      // Handle any errors that might occur during the fetch
      err instanceof Error ? err.message : 'An unexpected error occurred';
    });
  }, [fetchTrainerReports]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  // Handle loading and error states
  if (loading) return <CustomLoader />;

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Trainer Report
          </Typography>
          <SearchFilter onSearchChange={handleSearchChange} />
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
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((trainer) => (
                  <TableRow key={trainer.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography variant="subtitle2">{trainer.fullName}</Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer?.trainerExpertise
                          ?.map((expertiseItem: TrainerExpertise) => expertiseItem.expertise?.title) // Extract the title
                          .filter((title) => title && title !== '') // Filter out empty or undefined titles
                          .join(', ')}{' '}
                        {/* Join titles with a comma */}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.experience ? (
                          <>
                            <Barbell /> {trainer.experience} years
                          </>
                        ) : null}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography variant="subtitle2">{trainer.email}</Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{formatAmount(trainer.fees)}</TableCell>
                    <TableCell sx={tableCss.tableCell}></TableCell>
                    <TableCell sx={tableCss.tableCell}></TableCell>
                    <TableCell sx={tableCss.tableCell}></TableCell>
                    <TableCell sx={tableCss.tableCell}></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <CommonTablePagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(event, newPage) => setCurrentPage(newPage)}
            onRowsPerPageChange={(event) => setItemsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Card>
    </>
  );
};

export default MembershipReport;
