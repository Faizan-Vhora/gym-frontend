import React from 'react';
import { formatTo12HourFormat } from '@/utils/date-utils';
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
              <TableCell>Entry Date</TableCell>
              <TableCell>Entry In Time</TableCell>
              <TableCell>Entry Out Time</TableCell>
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
                  <TableCell>{dayjs(entry.entryDate).format('MMM D, YYYY')}</TableCell>
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
