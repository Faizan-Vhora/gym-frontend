import * as React from 'react';
import {
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
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

import { BOOKING_SESSION_STATUS, BOOKING_SESSION_STATUS_DETAILS } from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import { ArrowsClockwise, Note, XCircle } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface BookingSessionEntry {
  id: number;
  customer: {
    id: number;
    memberId: string;
    fullName: string;
    email: string;
    aboutMe: string;
    address: string;
    zipCode: string;
    dialCode: string;
    phoneNumber: string;
    gender: string;
    profileImageUrl: string;
    status: number;
  } | null;
  trainer: {
    id: number;
    memberId: string;
    fullName: string;
    email: string;
    aboutMe: string;
    address: string;
    zipCode: string;
    dialCode: string;
    phoneNumber: string;
    gender: string;
    profileImageUrl: string;
    status: number;
    experience: number;
    fees: number;
  } | null;
  createdAt: Date | string | null;
  createdBy: { fullName: string; email: string };

  status: string;

  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;

  paymentStatus: string;

  trainerRatePerHour: number;
  sessionCharge: number;
  discount: number;
  netTotalAmount: number;

  notes: string;
}

interface BookingTableProps {
  entries: BookingSessionEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: BookingSessionEntry['status']) => void;
  onUpdateNotes: (session: BookingSessionEntry) => void;
  onRescheduleSession: (session: BookingSessionEntry) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BookingSessionTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onUpdateNotes,
  onRescheduleSession,
  onPageChange,
  onRowsPerPageChange,
}: BookingTableProps): React.JSX.Element {
  const handleStatusChange = (id: number, newStatus: BookingSessionEntry['status']): void => {
    onUpdateStatus(id, newStatus);
  };

  const handleNotesChange = (session: BookingSessionEntry): void => {
    onUpdateNotes(session);
  };

  const handleRescheduleSession = (session: BookingSessionEntry): void => {
    onRescheduleSession(session);
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>Session Date</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Start Time</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>End Time</TableCell>
                {/* <TableCell sx={tableCss.tableHeaderCell}>Member</TableCell> */}
                {/* <TableCell sx={tableCss.tableHeaderCell}>Trainer</TableCell> */}
                <TableCell sx={tableCss.tableHeaderCell}>Session Amount</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Notes</TableCell>
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
                          <Typography variant="subtitle2">{formatDate(entry?.sessionDate)}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{formatTo12HourFormat(entry?.sessionStartTime)}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{formatTo12HourFormat(entry?.sessionEndTime)}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.customer?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry?.customer?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell> */}

                    {/* <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.trainer?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry?.trainer?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell> */}

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2"> {formatAmount(entry?.netTotalAmount)}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.notes || '-'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Chip
                        label={BOOKING_SESSION_STATUS_DETAILS[entry.status]?.label}
                        color={BOOKING_SESSION_STATUS_DETAILS[entry.status]?.color}
                        sx={{ ml: 2 }}
                      />
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={1} alignItems="center">

                        <IconButton
                          onClick={() => {
                            handleNotesChange(entry);
                          }}
                        >
                          <Note />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            handleRescheduleSession(entry);
                          }}
                        >
                          <ArrowsClockwise />
                        </IconButton>

                        {
                        entry.status !== BOOKING_SESSION_STATUS.CANCELLED
                        ?
                        (
                          <IconButton
                          onClick={() => {
                            handleStatusChange(entry.id, BOOKING_SESSION_STATUS.CANCELLED);
                          }}
                        >
                          <XCircle />
                        </IconButton>
                        )
                        : <></>

                      }

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
