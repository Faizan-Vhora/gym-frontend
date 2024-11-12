import * as React from 'react';
import { formatAmount, formatHours } from '@/utils/converter';
import { formatDate } from '@/utils/date-utils';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import tableCss from '@/styles/table-css';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number;
  userType: number;
  profileImageUrl: string | null;
  qrCodeImageUrl: string | null;
}

export interface OutstandingBilling {
  id: number;
  sessionDate: string; // ISO Date string
  sessionAmount: number;
  sessionDuration: number;
  sessionStatus: string;
  status: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

interface OutstandingBillingTableProps {
  rows: OutstandingBilling[];
  // onUpdateStatus: (id: number, newStatus: MembershipType['status']) => void;
}

export function OutstandingBillingTable({ rows }: OutstandingBillingTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Session Date</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Amount</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Duration</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Status</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
              {/* Here status will be Due or not Due */}
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
                  <TableCell sx={tableCss.tableCell}>{formatDate(row.sessionDate)}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{formatAmount(row.sessionAmount)}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{formatHours(row.sessionDuration)}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row.sessionStatus}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
