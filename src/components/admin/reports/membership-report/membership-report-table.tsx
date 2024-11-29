import * as React from 'react';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/utils/converter';
import { getStatusStringText, UserStatusString } from '@/utils/userstatus';
import {
  Box,
  Card,
  Chip,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import tableCss from '@/styles/table-css';

export interface MembershipPlans {
  id: string;
  title: string;
  cost: number;
  durationInMonths: number;
  expiryDate: Date;
  paymentFrequency: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: string;
  userCount?: number;
  cancelledCount?: number;
  completedCount?: number;
  revenue?: number;
  newMembersInlastXDays?: number;
  revenueInlastXDays?: string;
  cancellationInlastXDays?: number;
}

const formatPaymentFrequency = (value: string | undefined): string => {
  const formattedValue = value?.toLowerCase();

  if (formattedValue === 'yearly') {
    return 'Yearly';
  }
  if (formattedValue === 'monthly') {
    return 'Monthly';
  }
  return ''; // Return empty string or any default value if not 'yearly' or 'monthly'
};

interface MembershipPlanTableProps {
  lastXDays: string;
  rows: MembershipPlans[];
}

export function MembershipPlanReportTable({ lastXDays, rows }: MembershipPlanTableProps): React.JSX.Element {
  const router = useRouter();

  const handleRowClick = (id: string): void => {
    router.push(`/admin/reports/subscription-report?membershipId=${id}`); // Replace with the actual path to your form page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Plan</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Cost</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Payment Frequency</TableCell>

              <TableCell sx={tableCss.tableHeaderCell}>User Count</TableCell>

              <TableCell sx={tableCss.tableHeaderCell}>Cancelled</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Completed</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>New Members Last {lastXDays ? lastXDays : 0} days</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Revenue Last {lastXDays ? lastXDays : 0} days</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                Cancelled Memberships Last {lastXDays ? lastXDays : 0} days
              </TableCell>
              {/* <TableCell sx={tableCss.tableHeaderCell}>Revenue</TableCell> */}
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
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
                    <Typography variant="subtitle2">{row.title}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {row.durationInMonths} months
                    </Typography>
                  </TableCell>

                  <TableCell sx={tableCss.tableCell}>{formatAmount(row.cost)}</TableCell>

                  <TableCell sx={tableCss.tableCell}>{formatPaymentFrequency(row.paymentFrequency)}</TableCell>

                  <TableCell
                    sx={tableCss.tableCell}
                    onClick={() => {
                      handleRowClick(row.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.userCount}
                  </TableCell>

                  <TableCell sx={[tableCss.tableCell]}>{row.cancelledCount}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row.completedCount}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row?.newMembersInlastXDays || '-'}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{formatAmount(row?.revenueInlastXDays) || '-'}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row?.cancellationInlastXDays || '-'}</TableCell>
                  {/* <TableCell sx={tableCss.tableCell}>{formatAmount(row.revenue)}</TableCell> */}
                  <TableCell sx={tableCss.tableCell}>
                    <FormControlLabel
                      control={
                        <Chip
                          label={getStatusStringText(row.status as UserStatusString)}
                          color={row.status === 'active' ? 'success' : 'error'}
                          variant="filled"
                        />
                      }
                      label=""
                    />
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
