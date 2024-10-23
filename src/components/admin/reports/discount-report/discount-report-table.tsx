import * as React from 'react';
import { formatAmount } from '@/utils/converter';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import tableCss from '@/styles/table-css';

export interface DiscountReport {
  id: number;
  promocode: string;
  timesUsed: number;
  totalUsers: number;
  totalDiscount: string;
  totalBookings: number;
}

interface DiscountTableProps {
  rows: DiscountReport[];
}

export function DiscountReportTable({ rows }: DiscountTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Discount</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Usage Count</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Users Count</TableCell>

              <TableCell sx={tableCss.tableHeaderCell}>Total Discount</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Bookings Count</TableCell>
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
                    <Typography variant="subtitle2">{row.promocode}</Typography>
                  </TableCell>

                  <TableCell sx={tableCss.tableCell}>{row.timesUsed}</TableCell>

                  <TableCell sx={tableCss.tableCell}>{row.totalUsers}</TableCell>

                  <TableCell sx={[tableCss.tableCell]}>{formatAmount(row.totalDiscount)}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{row.totalBookings}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
