'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import axiosInstance from '@/lib/axios';
import tableCss from '@/styles/table-css';

const CodeNameTable = () => {
  const searchParams = useSearchParams();
  const codeName = searchParams.get('codeName');
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items (from API)

  interface UserData {
    id: number;
    fullName: string;
    email: string;
    memberId: number;
    phoneNumber: string;
    usageCount: number;
  }

  useEffect(() => {
    if (codeName) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get<{
            data: {
              items: UserData[];
              meta: { totalItems: number }; // Correctly define meta separately
            };
          }>(`/discount/user-list/${codeName}`, {
            params: {
              page: page + 1, // API pages typically start from 1, while MUI pagination starts at 0
              limit: rowsPerPage,
            },
          });
          setData(response.data.data.items); // Set the array of user items
          setTotalItems(response.data.data.meta.totalItems); // Set total items from meta for pagination
        } catch (err: unknown) {
          err instanceof Error ? err.message : 'An unexpected error occurred';
        } finally {
          setLoading(false);
        }
      };

      void fetchData();
    }
  }, [codeName, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page change
  };

  return (
    <>
      <Typography variant="h5" sx={{ padding: '20px' }} style={{ fontFamily: '"Audiowide", sans-serif' }}>
        PromoCode Claimed Users{' '}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCss.tableHeaderCell}>Id</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Name</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Email</TableCell>
              {/* Add more table headers as needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={tableCss.tableCell}>{item.memberId}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{item.fullName}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{item.email}</TableCell>
                  {/* Add more table cells as needed */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {loading && <CustomLoader />}
        {data.length > 0 && (
          <TablePagination
            component="div"
            count={totalItems} // Total number of items from the API
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={'Records per page'}
          />
        )}
      </TableContainer>
    </>
  );
};

export default CodeNameTable;
