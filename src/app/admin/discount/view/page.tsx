'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatAmount } from '@/utils/converter';
import { CustomLoader } from '@/utils/loader';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';

import axiosInstance from '@/lib/axios';
import tableCss from '@/styles/table-css';

const CodeNameTable = () => {
  const searchParams = useSearchParams();
  const codeName = searchParams.get('codeName');
  const router = useRouter();
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items (from API)

  interface UserData {
    id: number;
    fullName: string;
    email: string;
    memberId: number;
    phoneNumber: string;
    promoCodeUsageCount: number;
    totalDiscount: number;
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
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Grid container>
            <Grid item md={10}>
              <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="PromoCode Claimed Users" />
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ padding: '15px', display: 'flex', justifyContent: 'end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  router.push('/admin/discount');
                }}
                sx={{
                  borderColor: '#d0021b',
                  color: '#d0021b',
                  transform: 'skewX(-20deg)',
                  '&:hover': {
                    borderColor: 'darkred',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  },
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableCss.tableHeaderCell}>Id</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Name</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Email</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Phone Number</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Prmocode Used Count</TableCell>
                  <TableCell sx={tableCss.tableHeaderCell}>Total Claimed Discount</TableCell>
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
                    <TableRow sx={tableCss.tableRow} key={item.id}>
                      <TableCell sx={tableCss.tableCell}>{item.memberId}</TableCell>
                      <TableCell sx={tableCss.tableCell}>{item.fullName}</TableCell>
                      <TableCell sx={tableCss.tableCell}>{item.email}</TableCell>
                      <TableCell sx={tableCss.tableCell}>{item.phoneNumber}</TableCell>
                      <TableCell sx={tableCss.tableCell}>{item.promoCodeUsageCount}</TableCell>
                      <TableCell sx={tableCss.tableCell}>{formatAmount(item.totalDiscount)}</TableCell>
                      {/* Add more table cells as needed */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Divider />
        {loading && <CustomLoader />}
        {data.length > 0 && (
          <TablePagination
            component="div"
            count={totalItems} // Total number of items from the API
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={'Records per page'}
          />
        )}
      </Card>
    </>
  );
};

export default CodeNameTable;
