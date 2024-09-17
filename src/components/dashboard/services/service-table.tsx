import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getStatusStringText, UserStatusString } from '@/utils/userstatus';
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
  status: ServiceStatus; // Use enum for status
}

export enum ServiceStatus {
  Active = 'active',
  Inactive = 'inactive',
}

interface ServicesTableProps {
  services: Services[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  updateServiceStatus: (id: string, currentStatus: ServiceStatus) => void;
}

export function ServicesTable({
  services,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  updateServiceStatus,
}: ServicesTableProps): React.JSX.Element {
  const router = useRouter();

  const handleRowClick = (id: string): void => {
    router.push(`/dashboard/services/form?id=${id}`);
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
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow sx={tableCss.tableRow}>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              services.map((row) => (
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

                  <TableCell sx={tableCss.tableCell}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={row.status === ServiceStatus.Active} // Ensure you use the enum for comparison
                          onChange={(event) => {
                            event.stopPropagation();
                            // Convert row.status to the appropriate enum type if necessary
                            updateServiceStatus(row.id, row.status);
                          }}
                          color={row.status === ServiceStatus.Active ? 'success' : 'error'} // Use the enum here as well
                        />
                      }
                      label={getStatusStringText(row.status as UserStatusString)} // Assuming row.status is UserStatusString
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
