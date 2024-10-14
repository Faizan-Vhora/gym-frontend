import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Select,
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

import { useRouter } from 'next/navigation';
import { Chat, PencilSimple } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface SupportEntry {
  id: number;
  user: { id: number; fullName: string; email: string } | null;
  type: 'user' | 'trainer' | 'web';
  status: 'pending' | 'resolved' | 'reviewed';
  userType: 2 | 3;
  subject: string;
  message: string;
  description: string;
  createdAt: Date | string | null;
  createdBy: { fullName: string; email: string };
}

interface NotificationTableProps {
  entries: SupportEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: SupportEntry['status']) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NotificationTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onPageChange,
  onRowsPerPageChange,
}: NotificationTableProps): React.JSX.Element {
  const router = useRouter();

  const handleEdit = React.useCallback(
    (id: number) => {
      router.push(`/dashboard/support/form?id=${id}`);
    },
    [router]
  );

  const handleCheckMessages = React.useCallback(
    (id: number) => {
      router.push(`/dashboard/support/messages?id=${id}`);
    },
    [router]
  );

  const handleStatusChange = (id: number, newStatus: SupportEntry['status']): void => {
    onUpdateStatus(id, newStatus);
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>From</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Subject</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
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
                    <TableCell sx={tableCss.tableCell}>
                      {USER_TYPE_OPTIONS.find((ele: UserTypeOption) => ele.value === entry.userType)?.label || '-'}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{entry.subject}</TableCell>
                    <TableCell>
                      <Select
                        sx={{ height: '40px', width: '120px' }}
                        value={entry.status}
                        onChange={(e) => {
                          handleStatusChange(entry.id, e.target.value as SupportEntry['status']);
                        }}
                        displayEmpty
                        fullWidth
                      >
                        {SUPPORT_TICKET_STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => {
                            handleEdit(entry.id);
                          }}
                        >
                          <PencilSimple />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            handleCheckMessages(entry.id);
                          }}
                        >
                          <Chat />
                        </IconButton>
                      </Stack>
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
            />
          </>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
