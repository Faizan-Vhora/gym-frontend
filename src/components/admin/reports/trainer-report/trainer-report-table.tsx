import * as React from 'react';
import { TRAINER_STATUS_DETAILS } from '@/utils/constant';
import { formatAmount, formatHours } from '@/utils/converter';
import { Box, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Barbell } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

import { Trainer } from '../../trainer/trainer-table';

interface TrainerTableProps {
  rows: Trainer[];
}

export function TrainerReportTable({ rows }: TrainerTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCss.tableHeaderCell}>Trainer</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Fees (Per Hour)</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Attendance</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Counts</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Hours</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Session Revenue</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow sx={tableCss.tableRow}>
                <TableCell colSpan={7} align="center">
                  {' '}
                  {/* Corrected colSpan to 7 to match the number of columns */}
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(
                (
                  trainer // Removed curly braces around the map
                ) => (
                  <TableRow key={trainer.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography variant="subtitle2">{trainer.fullName}</Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer?.trainerExpertise
                          ?.map((expertiseItem) => expertiseItem.expertise?.title)
                          .filter((title) => title && title !== '')
                          .join(', ')}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.experience ? (
                          <>
                            <Barbell /> {trainer.experience} years
                          </>
                        ) : null}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.email}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{formatAmount(trainer.fees)}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography variant="body2">
                        {trainer.attendanceDetail ? `Available Days : ${trainer.attendanceDetail?.available}` : ''}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.attendanceDetail ? `On Leave : ${trainer.attendanceDetail?.unAvailable}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography variant="body2">
                        {trainer.sessionDetail ? `Total: ${trainer.sessionDetail.totalSession}` : null}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.sessionDetail ? `Completed: ${trainer.sessionDetail.completedSession}` : null}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {trainer.sessionDetail ? `Cancelled: ${trainer.sessionDetail.cancelledSession}` : null}
                        {/* {trainer.sessionDetail ? `Cancelled : ${trainer.sessionDetail.cancelledSession}` : ''} */}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {trainer.sessionDetail ? formatHours(trainer.sessionDetail.sessionTotalHours) : ''}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {trainer.sessionDetail ? formatAmount(trainer.sessionDetail?.sessionTotalRevenue) : ''}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Chip
                        label={TRAINER_STATUS_DETAILS[trainer.status]?.label}
                        color={TRAINER_STATUS_DETAILS[trainer.status]?.color}
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
