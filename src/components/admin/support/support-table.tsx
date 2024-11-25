import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  // IconButton,
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
import { SUPPORT_TICKET_STATUS_OPTIONS, USER_TYPE_OPTIONS, UserTypeOption } from '@/utils/constant';
import { formatDate } from '@/utils/date-utils';

// import { Chat, PencilSimple } from '@phosphor-icons/react';
import tableCss from '@/styles/table-css';

export interface SupportEntry {
  id: number;
  user: { id: number; fullName: string; email: string; userType: number; memberId: string } | null;
  type: 'user' | 'trainer' | 'web';
  status: 'pending' | 'resolved' | 'reviewed';
  userType: 2 | 3;
  subject: string;
  message: string;
  description: string;
  createdAt: Date | string | null;
  createdBy: { fullName: string; email: string };
}

export interface SupportTicketMessageEntry {
  id: number;
  message: string;
  createdAt: Date | string | null;
  createdBy: { fullName: string; email: string };
  updatedAt: Date | string | null;
  updatedBy: { fullName: string; email: string };
}

interface SupportTableProps {
  entries: SupportEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: SupportEntry['status']) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SupportTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onPageChange,
  onRowsPerPageChange,
}: SupportTableProps): React.JSX.Element {
  const router = useRouter();

  // const handleEdit = React.useCallback(
  //   (id: number) => {
  //     router.push(`/admin/support/form?id=${id}`);
  //   },
  //   [router]
  // );

  // const handleCheckMessages = React.useCallback(
  //   (id: number) => {
  //     router.push(`/admin/support/messages?id=${id}`);
  //   },
  //   [router]
  // );

  const handleRowClick = (id: number): void => {
    router.push(`/admin/support/form?id=${id}`); // Replace with the actual path to your form page
  };

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
                <TableCell sx={tableCss.tableHeaderCell}>Created At</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                {/* <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell> */}
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
                    <TableCell
                      sx={{ ...tableCss.tableCell, textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => {
                        if (entry?.userType === 3) {
                          router.push(`/admin/customers/form?id=${entry?.user?.id}&tab=1`);
                        } else if (entry?.userType === 2) {
                          router.push(`/admin/trainers/form?id=${entry?.user?.id}&tab=1`);
                        }
                      }}
                    >
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
                    <TableCell
                      sx={{
                        ...tableCss.tableCell,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        handleRowClick(entry.id);
                      }} // Pass entry as parameter
                    >
                      {entry.subject}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {entry.createdAt && (
                        <Typography color="textSecondary">
                          {formatDate(
                            typeof entry.createdAt === 'string'
                              ? entry.createdAt
                              : entry.createdAt instanceof Date
                                ? entry.createdAt.toISOString().split('T')[0]
                                : ''
                          )}
                        </Typography>
                      )}
                    </TableCell>
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

                    {/* <TableCell sx={tableCss.tableCell}>
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
                    </TableCell> */}
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
              rowsPerPageOptions={[10, 15, 25]}
            />
          </>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
