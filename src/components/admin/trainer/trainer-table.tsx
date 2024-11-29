import * as React from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date-utils';
import { getStatusText } from '@/utils/userstatus';
import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface TrainerExpertise {
  id: number;
  createdAt: string;
  updatedAt: string;
  expertise: {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TrainerAttendanceDetail {
  available: number;
  unAvailable: number;
}

export interface TrainerSessionDetail {
  totalSession: number;
  incomingSession: number;
  startedSession: number;
  completedSession: number;
  cancelledSession: number;
  sessionTotalRevenue: number;
  sessionTotalHours: number;
}

export interface Trainer {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string; // Adjust if address is an object
  createdAt: string;
  updatedAt: string;
  status: number;
  memberId: string;
  trainerExpertise: TrainerExpertise[];
  aboutMe: string;
  experience: number;
  fees: number;
  profileImageUrl?: string;
  qrCodeImageUrl: string;
  setSameTimeForAllDay: boolean;
  attendanceDetail?: TrainerAttendanceDetail; // Attendance data
  sessionDetail?: TrainerSessionDetail; // Session counts
}

interface TrainerTableProps {
  count: number;
  page: number;
  rowsPerPage: number;
  rows: Trainer[];
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateTrainerStatus: (id: string, currentStatus: number) => void; // Added prop
}

export function TrainersTable({
  count,
  page,
  rowsPerPage,
  rows,
  onPageChange,
  onRowsPerPageChange,
  updateTrainerStatus,
}: TrainerTableProps): React.JSX.Element {
  const router = useRouter();

  const handleEdit = React.useCallback(
    (id: string) => {
      router.push(`/admin/trainers/form?id=${id}&tab=1`);
    },
    [router]
  );

  const handleRowClick = (id: string): void => {
    router.push(`/admin/trainers/form?id=${id}&tab=1`); // Replace with the actual path to your form page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Address</TableCell>
              <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Phone</TableCell>
              <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Updated At</TableCell>
              <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow sx={tableCss.tableRow}>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow hover key={row.id} sx={tableCss.tableRow}>
                  <TableCell sx={{ ...tableCss.tableCell, textAlign: 'left' }}>
                    <Typography
                      variant="subtitle2"
                      onClick={() => {
                        handleRowClick(String(row.id));
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {row.fullName}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="body2"
                      onClick={() => {
                        handleRowClick(String(row.id));
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {row.trainerExpertise
                        ?.map((expertiseItem: TrainerExpertise) => expertiseItem.expertise?.title) // Extract the title
                        .filter((title) => title && title !== '') // Filter out empty or undefined titles
                        .join(', ')}{' '}
                      {/* Join titles with a comma */}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={[
                      tableCss.tableCell,
                      {
                        maxWidth: '55px !important',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis !important',
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {row.address || '-'}
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>{row.phoneNumber || '-'}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{formatDate(row.updatedAt)}</TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={row.status === 1}
                          onChange={(event) => {
                            event.stopPropagation();
                            updateTrainerStatus(String(row.id), row.status);
                          }}
                          color={row.status === 1 ? 'success' : 'error'}
                        />
                      }
                      label={getStatusText(row.status)}
                    />
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={() => {
                          handleEdit(String(row.id));
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      {rows.length > 0 && (
        <>
          <Divider />
          <TablePagination
            component="div"
            count={count}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(event, newPage) => {
              onPageChange(event, newPage);
            }}
            onRowsPerPageChange={(event) => {
              const inputEvent = event as React.ChangeEvent<HTMLInputElement>;
              onRowsPerPageChange(inputEvent);
            }}
            rowsPerPageOptions={[10, 15, 25]}
            labelRowsPerPage={'Records per page'}
          />
        </>
      )}
    </Card>
  );
}
