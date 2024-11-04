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

import { useRouter } from 'next/navigation';
import { BOOKING_STATUS, BOOKING_STATUS_DETAILS } from '@/utils/constant';
import { formatHours } from '@/utils/converter';
import { formatDate } from '@/utils/date-utils';
import { XCircle } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface BookingEntry {
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
  bookingType: 'one_time' | 'weekly';
  status: string;
  startDate: string;
  endDate: string;
  bookingHours: number;
  bookingAmount: number;
  netTotalAmount: number;
  paymentType: 'per_session';
  paymentStatus: 'pending';
  weekdays: string;
  recurrenceWeeks: number;
  discount: number;
  trainerRatePerHour: number;
  createdAt: Date | string | null;
  createdBy: { fullName: string; email: string };
}

interface BookingTableProps {
  entries: BookingEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: BookingEntry['status']) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BookingTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onPageChange,
  onRowsPerPageChange,
}: BookingTableProps): React.JSX.Element {
  const router = useRouter();

  const handleStatusChange = (id: number, newStatus: BookingEntry['status']): void => {
    onUpdateStatus(id, newStatus);
    // toast.success('Status updated successfully!'); // Show success toast
  };

  const handleRowClick = (id: number): void => {
    router.push(`/admin/bookings/view?id=${id}&tab=1`); // Replace with the actual path to your form page
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>Booking ID</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Booking Date</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Member</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Trainer</TableCell>
                {/* <TableCell sx={tableCss.tableHeaderCell}>Booking Type</TableCell> */}
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
                    <TableCell
                      sx={tableCss.tableCell}
                      onClick={() => {
                        handleRowClick(entry.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      #{entry.id}
                    </TableCell>

                    <TableCell sx={{ ...tableCss.tableCell, textAlign: 'left' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="subtitle2">
                            {entry?.startDate === entry?.endDate
                              ? formatDate(entry?.startDate) // No need for template literals
                              : formatDate(entry?.startDate) + ' to ' + formatDate(entry?.endDate)}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {formatHours(entry?.bookingHours)} {/* No change needed here */}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ ...tableCss.tableCell, textAlign: 'left' }}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.customer?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry?.customer?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ ...tableCss.tableCell, textAlign: 'left' }}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry?.trainer?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry?.trainer?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* <TableCell sx={tableCss.tableCell}>

                      <Chip
                        label={BOOKING_TYPE_DETAILS[entry.bookingType]?.label}
                        color={BOOKING_TYPE_DETAILS[entry.bookingType]?.color}
                        sx={{ ml: 2 }}
                      />


                      </TableCell> */}

                    <TableCell sx={tableCss.tableCell}>
                      <Chip
                        label={BOOKING_STATUS_DETAILS[entry.status]?.label}
                        color={BOOKING_STATUS_DETAILS[entry.status]?.color}
                        sx={{ ml: 2 }}
                      />
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          disabled={[BOOKING_STATUS.CANCELED, BOOKING_STATUS.COMPLETED].includes(entry.status)}
                          onClick={() => {
                            handleStatusChange(entry.id, BOOKING_STATUS.CANCELED);
                          }}
                        >
                          <XCircle />
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
              labelRowsPerPage={'Records per page'}
            />
          </>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
