import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getStatusText } from '@/utils/userstatus';
import {
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  status: number; // Ensure this is part of the interface
  qrCodeImageUrl: string;
  changeProfileImage: boolean;
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
  updateCustomerStatus: (id: string, currentStatus: number) => void; // Added prop
}

export function CustomersTable({
  count,
  page,
  rowsPerPage,
  rows,
  onPageChange,
  onRowsPerPageChange,
  updateCustomerStatus, // Added prop
}: CustomersTableProps): React.JSX.Element {
  const router = useRouter();

  const handleEdit = React.useCallback(
    (id: string) => {
      router.push(`/dashboard/customers/form?id=${id}`);
    },
    [router]
  );

  const handleRowClick = (id: string): void => {
    router.push(`/dashboard/customers/form?id=${id}`); // Replace with the actual path to your form page
  };

  return (
    <Stack>
      <Box sx={{ overflowX: 'auto', marginTop: '30px' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
              <TableCell
                sx={{
                  ...tableCss.tableHeaderCell,
                  width: '250px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Address
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Phone</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Updated At</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Membership Plan</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
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
                <>
                  <TableRow hover key={row.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography
                        variant="subtitle2"
                        onClick={() => {
                          handleRowClick(row.id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {row.fullName}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="body2"
                        onClick={() => {
                          handleRowClick(row.id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {row.email}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        ...tableCss.tableCell,
                        width: '50px !important',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis !important',
                      }}
                    >
                      {row.address || '-'}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{row.phoneNumber || '-'}</TableCell>
                    <TableCell sx={tableCss.tableCell}>{dayjs(row.updatedAt).format('MMM D, YYYY')}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography color="black" variant="subtitle2">
                        {row?.membership?.membershipType?.title || '-'}
                      </Typography>

                      {row?.membership?.membershipType?.title &&
                        row?.membership?.expiryDate &&
                        !isNaN(new Date(row?.membership?.expiryDate).getTime()) && (
                          <Typography color="textSecondary" variant="body2">
                            Exp: {dayjs(row?.membership?.expiryDate).format('MMM D, YYYY')}
                          </Typography>
                        )}
                    </TableCell>

                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={row.status === 1}
                            onChange={(event) => {
                              event.stopPropagation();
                              updateCustomerStatus(row.id, row.status);
                            }}
                            color={row.status === 1 ? 'success' : 'error'}
                          />
                        }
                        label={getStatusText(row.status)}
                      />
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => {
                            handleEdit(row.id);
                          }}
                        >
                          <PencilSimple />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
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
    </Stack>
  );
}
