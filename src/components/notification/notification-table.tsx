import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { ToastContainer } from 'react-toastify'; // Import toast and ToastContainer

import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface NotificationEntry {
  id: number;
  user: { id: number; fullName: string; email: string; userType: 2 | 3 } | null;
  title: string;
  message: string;
  notificationType: number;
  isRead: boolean;
  data: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  createdBy: { fullName: string; email: string };
}

interface NotificationTableProps {
  entries: NotificationEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NotificationTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onPageChange,
  onRowsPerPageChange,
}: NotificationTableProps): React.JSX.Element {
  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Message</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Created At</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow sx={tableCss.tableRow}>
                  <TableCell sx={tableCss.tableCell} colSpan={5} align="center">
                    <Typography variant="body1">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow hover key={entry.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.user?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry?.user?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{entry?.title}</TableCell>
                    <TableCell sx={tableCss.tableCell}>{entry?.message}</TableCell>

                    <TableCell sx={tableCss.tableCell}>{dayjs(entry.createdAt).format('MMM D, YYYY')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {entries.length > 0 && (
          <>
            <Divider />

            <TablePagination
              component="div"
              count={totalEntries}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, newPage) => {
                onPageChange(newPage);
              }}
              onRowsPerPageChange={(event) => {
                const inputEvent = event as React.ChangeEvent<HTMLInputElement>;
                onRowsPerPageChange(inputEvent);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={'Records per page'}
            />
          </>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
