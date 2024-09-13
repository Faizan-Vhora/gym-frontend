import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getStatusStringText } from '@/utils/userstatus';
import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface Services {
  id: string;
  title: string;
  serviceImage: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string; // Ensure this is part of the interface
}

interface ServicesTableProps {
  count: number;
  page: number;
  rowsPerPage: number;
  rows: Services[];
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateServiceStatus: (id: string, currentStatus: string) => void; // Added prop
}

export function CustomersTable({
  count,
  page,
  rowsPerPage,
  rows,
  onPageChange,
  onRowsPerPageChange,
  updateServiceStatus, // Added prop
}: ServicesTableProps): React.JSX.Element {
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
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>

              <TableCell sx={tableCss.tableHeaderCell}>Description</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Updated At</TableCell>
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
                <>
                  <TableRow hover key={row.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Typography
                        variant="subtitle2"
                        onClick={() => {
                          handleRowClick(row.id);
                        }}
                      >
                        {row.title}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>{row.description || '-'}</TableCell>
                    <TableCell sx={tableCss.tableCell}>{dayjs(row.updatedAt).format('MMM D, YYYY')}</TableCell>

                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={row.status === 'active'}
                            onChange={(event) => {
                              event.stopPropagation();
                              updateServiceStatus(row.id, row.status);
                            }}
                            color={row.status === 'active' ? 'success' : 'error'}
                          />
                        }
                        label={getStatusStringText(row.status as UserStatusString)}
                      />
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
    </Card>
  );
}
