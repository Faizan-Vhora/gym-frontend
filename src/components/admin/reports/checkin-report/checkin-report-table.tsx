import React from 'react';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
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
  };
  timezone?: string | null;
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
  rows: CheckInEntry[];
}

export function CheckInReportTable({ rows }: CheckInTableProps): React.JSX.Element {
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
              <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>User Type</TableCell>
              <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ ...tableCss.tableCell, textAlign: 'left' }}>
                    <Typography variant="subtitle2">{entry.user?.fullName}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {entry.user?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(entry.entryDate)}</TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {formatTo12HourFormat(entry.entryInTime, entry.timezone)}
                  </TableCell>
                  <TableCell>
                    <IconButton>
                      <Clock />
                    </IconButton>
                    {entry.entryOutTime ? formatTo12HourFormat(entry?.entryOutTime, entry.timezone) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userTypeStatus[entry.user?.userType]?.label}
                      color={userTypeStatus[entry.user?.userType]?.color}
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
    </Card>
  );
}
