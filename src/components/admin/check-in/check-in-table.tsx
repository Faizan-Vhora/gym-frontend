import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import {
  Avatar,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { Clock } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface CheckInEntry {
  id: number;
  entryDate: string;
  entryInTime: string;
  entryOutTime: string;
  failedReason: string;
  status: 'success' | 'failed';
  user: {
    id: string | undefined;
    fullName: string;
    email: string;
    userType: number;
    profileImageUrl?: string;
  };
}

const userTypeStatus: Record<number, { label: string; color: 'warning' | 'success' }> = {
  2: { label: 'Trainer', color: 'warning' },
  3: { label: 'Member', color: 'success' },
};

const checkInStatus: Record<string, { label: string; color: 'error' | 'success' }> = {
  success: { label: 'Success', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
};

interface CheckInTableProps {
  entries: CheckInEntry[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // onEdit: (id: number) => void;
  // onDelete: (id: number) => void;
}

export function CheckInTable({
  entries,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  // onEdit,
  // onDelete,
}: CheckInTableProps): React.JSX.Element {
  const router = useRouter();
  // const handleRowClick = (id: string): void => {
  //   router.push(`/admin/check-in/form?id=${id}`); // Replace with the actual path to your form page
  // };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Entry Date</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Entry In Time</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Entry Out Time</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>User Type</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
              {/* <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell
                    sx={{ ...tableCss.tableCell, textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => {
                      if (entry?.user?.userType === 3) {
                        router.push(`/admin/customers/form?id=${entry?.user?.id}&tab=1`);
                      } else if (entry?.user?.userType === 2) {
                        router.push(`/admin/trainers/form?id=${entry?.user?.id}&tab=1`);
                      }
                    }}
                  >
                    <Stack flexDirection={'row'} columnGap={2} paddingY={1}>
                      <Avatar
                        src={entry?.user?.profileImageUrl || '/assets/User@3x-1.png'}
                        sx={{ height: '56px', width: '56px' }}
                      />
                      <Stack>
                        <Typography variant="subtitle2">{entry.user.fullName}</Typography>
                        <Typography color="textSecondary" variant="body2">
                          {entry.user.email}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(entry.entryDate)}</TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {formatTo12HourFormat(entry.entryInTime)}
                  </TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {entry.entryOutTime ? formatTo12HourFormat(entry.entryOutTime) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userTypeStatus[entry.user.userType]?.label}
                      color={userTypeStatus[entry.user.userType]?.color}
                      sx={{ ml: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      style={{ cursor: 'pointer' }}
                      title={entry.status === 'failed' ? entry.failedReason : ''}
                      disableHoverListener={entry.status !== 'failed'}
                    >
                      <Chip
                        label={checkInStatus[entry.status]?.label}
                        color={checkInStatus[entry.status]?.color}
                        sx={{ ml: 2 }}
                      />
                    </Tooltip>
                  </TableCell>
                  {/* <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={() => {
                          onEdit(entry.id);
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          onDelete(entry.id);
                        }}
                      >
                        <Trash />
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
            count={count}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={'Records per page'}
          />
        </>
      )}
    </Card>
  );
}
