import * as React from 'react';
import { formatAmount } from '@/utils/converter';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';

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

export interface MembershipType {
  id: number;
  title: string;
  cost: string;
  durationInMonths: number;
  paymentFrequency: string;
  status: string;
}

export interface Subscription {
  id: number;
  startDate: string; // ISO Date string
  expiryDate: string; // ISO Date string
  status: string;
  paymentStatus: string;
  totalPaymentAmount: number;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  user: User;
  membershipType: MembershipType;
}

interface SubscriptionTableProps {
  rows: Subscription[];
}

export function SubscriptionReportTable({ rows }: SubscriptionTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Membership</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Subscription Date</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Start Date</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Expiry Date</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Revenue</TableCell>
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
                  <TableCell sx={tableCss.tableCell}>
                    <Typography variant="subtitle2">{row.user.fullName}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {row.user.email}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tableCss.tableCell}>
                    <Typography variant="subtitle2">{row.membershipType.title}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {row.membershipType.durationInMonths} months
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{dayjs(row.startDate).format('MMM D, YYYY')}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{dayjs(row.expiryDate).format('MMM D, YYYY')}</TableCell>

                  <TableCell sx={[tableCss.tableCell]}>{formatAmount(row.totalPaymentAmount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
