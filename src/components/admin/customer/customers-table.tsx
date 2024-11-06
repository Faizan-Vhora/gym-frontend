import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MEMBERSHIP_PAYMENT_STATUS_DETAILS,
  // MEMBERSHIP_PLAN_STATUS,
  MEMBERSHIP_PLAN_STATUS_DETAILS,
} from '@/utils/constant';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
// import { getStatusText } from '@/utils/userstatus';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  // FormControlLabel,
  // IconButton,
  Stack,
  // Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Clock } from '@phosphor-icons/react';

// import { PencilSimple, XCircle } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

import { MembershipType } from '../subscriptions/subscription-table';

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  status: number; // Ensure this is part of the interface
  qrCodeImageUrl: string;
  profileImageUrl?: string;
  changeProfileImage: boolean;
  lastEntryInTime?: string;
  lastEntryDate?: string;
  membership: {
    startDate: Date;
    expiryDate: Date;
    status: string;
    paymentStatus: string;
    membershipType: {
      id: string;
      title: string;
      durationInMonths: number;
      description: string;
      cost: number;
      paymentFrequency: string;
    };
  };
}

interface CustomersTableProps {
  count: number;
  page: number;
  rowsPerPage: number;
  rows: Customer[];
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // updateCustomerStatus: (id: string, currentStatus: number) => void; // Added prop
  onUpdateStatus: (id: number, newStatus: MembershipType['status']) => void;
}

export function CustomersTable({
  count,
  page,
  rowsPerPage,
  rows,
  onPageChange,
  onRowsPerPageChange,
  // updateCustomerStatus, // Added prop
  // onUpdateStatus,
}: CustomersTableProps): React.JSX.Element {
  const router = useRouter();

  // const handleEdit = React.useCallback(
  //   (id: string) => {
  //     router.push(`/admin/customers/form?id=${id}&tab=1`);
  //   },
  //   [router]
  // );

  // const handleStatusChange = (id: number, newStatus: MembershipType['status']): void => {
  //   onUpdateStatus(id, newStatus);
  // };

  const handleRowClick = (id: string): void => {
    router.push(`/admin/customers/form?id=${id}&tab=1`); // Replace with the actual path to your form page
  };

  return (
    <Stack>
      <Box sx={{ overflowX: 'auto', marginTop: '30px' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
              {/* <TableCell
                sx={{
                  ...tableCss.tableHeaderCell,
                  width: '250px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Address
              </TableCell> */}
              <TableCell sx={tableCss.tableHeaderCell}>Phone</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Last CheckIn</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Membership Plan</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Membership Payment Status</TableCell>
              {/* <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell> */}
              <TableCell sx={tableCss.tableHeaderCell}>Membership Status</TableCell>
              {/* <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell> */}
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
                      {row.email}
                    </Typography>
                  </TableCell>

                  {/* <TableCell
                    sx={{
                      ...tableCss.tableCell,
                      maxWidth: '70px !important',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis !important',
                      textAlign: 'left',
                    }}
                  >
                    {row.address || '-'}
                  </TableCell> */}
                  <TableCell sx={tableCss.tableCell}>{row.phoneNumber || '-'}</TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    {row.lastEntryDate && row.lastEntryInTime ? (
                      <>
                        <Typography variant="subtitle2">{formatDate(row.lastEntryDate)}</Typography>
                        <Typography color="textSecondary" variant="body2">
                          <>
                            <IconButton>
                              <Clock />
                            </IconButton>
                            {row.lastEntryInTime ? formatTo12HourFormat(row.lastEntryInTime) : '-'}
                          </>
                        </Typography>
                      </>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {/* <TableCell sx={tableCss.tableCell}>{formatDate(row.updatedAt)}</TableCell> */}
                  <TableCell sx={tableCss.tableCell}>
                    <Typography color="black" variant="subtitle2">
                      {row?.membership?.membershipType?.title || '-'}
                    </Typography>
                    {row?.membership?.membershipType?.title &&
                      row?.membership?.startDate &&
                      (() => {
                        const startDate = new Date(row.membership.startDate);
                        return !isNaN(startDate.getTime()) ? (
                          <Typography color="textSecondary" variant="body2">
                            Start: {formatDate(startDate.toISOString().split('T')[0])}
                          </Typography>
                        ) : null;
                      })()}

                    {row?.membership?.membershipType?.title &&
                      row?.membership?.expiryDate &&
                      (() => {
                        const expiryDate = new Date(row.membership.expiryDate);
                        return !isNaN(expiryDate.getTime()) ? (
                          <Typography color="textSecondary" variant="body2">
                            Exp: {formatDate(expiryDate.toISOString())}
                          </Typography>
                        ) : null;
                      })()}
                  </TableCell>
                  <TableCell sx={[tableCss.tableCell]}>
                    {row?.membership?.paymentStatus ? (
                      <Chip
                        label={MEMBERSHIP_PAYMENT_STATUS_DETAILS[row.membership?.paymentStatus]?.label}
                        color={MEMBERSHIP_PAYMENT_STATUS_DETAILS[row.membership?.paymentStatus]?.color}
                        sx={{ ml: 2 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {/* <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={row.status === 1}
                          onChange={(event) => {
                            event.stopPropagation();
                            updateCustomerStatus(String(row.id), row.status);
                          }}
                          color={row.status === 1 ? 'success' : 'error'}
                        />
                      }
                      label={getStatusText(row.status)}
                    />
                  </TableCell> */}
                  <TableCell sx={[tableCss.tableCell]}>
                    {row?.membership?.status ? (
                      <Chip
                        label={MEMBERSHIP_PLAN_STATUS_DETAILS[row.membership?.status]?.label}
                        color={MEMBERSHIP_PLAN_STATUS_DETAILS[row.membership?.status]?.color}
                        sx={{ ml: 2 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {/* <TableCell sx={tableCss.tableCell}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={() => {
                          handleEdit(String(row.id));
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                      <IconButton
                        disabled={
                          !row.membership?.status ||
                          [MEMBERSHIP_PLAN_STATUS.CANCEL, MEMBERSHIP_PLAN_STATUS.EXPIRED].includes(
                            row.membership.status
                          )
                        }
                        onClick={() => {
                          handleStatusChange(row.id, MEMBERSHIP_PLAN_STATUS.CANCEL);
                        }}
                      >
                        <XCircle />
                      </IconButton>
                    </Stack>
                  </TableCell> */}
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
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={'Records per page'}
          />
        </>
      )}
    </Stack>
  );
}
