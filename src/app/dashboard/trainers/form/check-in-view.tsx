import React from 'react';
import { convertTo12HourFormat } from '@/utils/date-utils';
import {
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
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
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface CheckInEntry {
  id: number;
  entryDate: string;
  entryInTime: string;
  entryOutTime: string;
  failedReason: string;
  status: 'success' | 'failed';
  user: {
    fullName: string;
    email: string;
    userType: number;
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
}

export function CheckInTableView({
  entries,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: CheckInTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Details</TableCell>
              <TableCell>Entry Date</TableCell>
              <TableCell>Entry In Time</TableCell>
              <TableCell>Entry Out Time</TableCell>
              <TableCell>User Type</TableCell>
              <TableCell>Status</TableCell>
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
                  <TableCell sx={tableCss.tableCell}>
                    <Typography variant="subtitle2" style={{ cursor: 'pointer' }}>
                      {entry.user.fullName}
                    </Typography>
                    <Typography color="textSecondary" variant="body2" style={{ cursor: 'pointer' }}>
                      {entry.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{dayjs(entry.entryDate).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {convertTo12HourFormat(entry.entryInTime)}
                  </TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {entry.entryOutTime ? convertTo12HourFormat(entry.entryOutTime) : '-'}
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
          />
        </>
      )}
    </Card>
  );
}
