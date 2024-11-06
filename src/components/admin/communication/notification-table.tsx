import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
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

import { formatDate } from '@/utils/date-utils';
import { Trash } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface NotificationEntry {
  id: number;
  user: { id: number; fullName: string; email: string; userType: 2 | 3 } | null;
  title: string;
  message: string;
  notificationType: number;
  noOfNotifications: number;
  redirectionPath: string;
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
  onDelete: (id: number) => void;
}

export function CommunicationTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
}: NotificationTableProps): React.JSX.Element {
  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Message</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Users Count</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Created At</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Action</TableCell>
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
                    <TableCell sx={tableCss.tableCell}>{entry?.title}</TableCell>
                    <TableCell sx={tableCss.tableCell} dangerouslySetInnerHTML={{ __html: entry?.message }} />
                    <TableCell sx={tableCss.tableCell}>{entry?.noOfNotifications}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {entry.updatedAt && (
                        <Typography color="textSecondary">
                          {formatDate(
                            typeof entry.updatedAt === 'string'
                              ? entry.updatedAt
                              : entry.updatedAt instanceof Date
                                ? entry.updatedAt.toISOString().split('T')[0]
                                : ''
                          )}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <IconButton
                        onClick={() => {
                          onDelete(entry.id);
                        }}
                      >
                        <Trash />
                      </IconButton>
                    </TableCell>
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
