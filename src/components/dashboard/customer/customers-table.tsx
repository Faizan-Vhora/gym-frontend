import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getStatusText } from '@/utils/userstatus';
import {
  Box,
  Card,
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
import { toast } from 'react-toastify';

import tableCss from '@/styles/table-css';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  status: number; // Ensure this is part of the interface
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
      toast.success(`Edit customer with id: ${id}`);
    },
    [router]
  );

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
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
              <TableCell sx={tableCss.tableHeaderCell}>Signed Up</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
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
                    <Typography variant="subtitle2">{row.fullName}</Typography>
                    <Typography color="textSecondary" variant="body2">
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
                  <TableCell sx={tableCss.tableCell}>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
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

                  <TableCell sx={tableCss.tableCell}>
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
                </TableRow>
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
    </Card>
  );
}
