'use client';

import React, { useEffect, useState } from 'react';
import { formatAmount } from '@/utils/converter';
import { CustomLoader } from '@/utils/loader';
import {
  Box,
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

import axiosInstance from '@/lib/axios';
import CommonTablePagination from '@/components/dashboard/reports/pagination'; // Adjust the import path as necessary
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
}

const TrainerReport: React.FC = () => {
  const [data, setData] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Function to fetch data
  const fetchData = async (page: number, limit: number) => {
    try {
      const response = await axiosInstance.get<ApiResponse>(`/report/trainer-report?page=${page + 1}&limit=${limit}`);
      setData(response.data.data.items);
      setTotalItems(response.data.data.meta.totalItems);
      setLoading(true);
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when the component mounts or when the page or itemsPerPage changes
  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Handle loading and error states
  if (loading) return <CustomLoader />;

  return (
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
                    {trainer.experience ? `${trainer.experience} years` : ''}
                  </Typography>
                </TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <Typography variant="subtitle2">{trainer.email}</Typography>
                  <Typography color="textSecondary" variant="body2">
                    {trainer.phoneNumber}
                  </Typography>
                </TableCell>
                <TableCell sx={tableCss.tableCell}>{formatAmount(trainer.fees)}</TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <Typography variant="body2">
                    {' '}
                    {trainer.availableDays ? `Available Days : ${trainer.availableDays}` : ''}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    On Leave : {trainer.onLeave}
                  </Typography>
                </TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <Typography variant="body2">Total Sessions{trainer.totalSessions}</Typography>
                  <Typography color="textSecondary" variant="body2">
                    Completed Sessions : {trainer.completedSessions}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Cancelled Sessions : {trainer.cancelledSessions}
                  </Typography>
                </TableCell>
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
        onRowsPerPageChange={(event) => setItemsPerPage(parseInt(event.target.value, 5))}
      />
    </Paper>
  );
};

export default TrainerReport;
