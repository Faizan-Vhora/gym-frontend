import React from 'react';
import { useRouter } from 'next/navigation';
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
import { PencilSimple, Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface ExpertiseEntry {
  id: number;
  title: string;
  status: 'active' | 'inactive';
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ExpertiseTableProps {
  entries: ExpertiseEntry[];
  count: number;
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: 'active' | 'inactive') => void;
}

export function ExpertiseTable({
  entries,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: ExpertiseTableProps): React.JSX.Element {
  const router = useRouter();
  // const formatDate = (inputDate: Date | string): string => {
  //   let date: Date;
  //   if (typeof inputDate === 'string') {
  //     date = new Date(inputDate);
  //   } else {
  //     date = inputDate;
  //   }
  //   return date.toLocaleDateString();
  // };

  const handleToggleStatus = (id: number, currentStatus: 'active' | 'inactive'): void => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    onToggleStatus(id, newStatus);
  };

  const handleRowClick = (id: number): void => {
    router.push(`/dashboard/expertise/form?id=${id}`); // Replace with the actual path to your form page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Updated At</TableCell>
              <TableCell
                sx={{
                  ...tableCss.tableHeaderCell,
                  width: '200px', // Adjust width as needed
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Status
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow sx={tableCss.tableRow}>
                <TableCell colSpan={4} align="center" sx={tableCss.tableCell}>
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} sx={tableCss.tableRow}>
                  <TableCell
                    sx={tableCss.tableCell}
                    onClick={() => {
                      handleRowClick(entry.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {entry.title}
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>{dayjs(entry.updatedAt).format('MMM D, YYYY')}</TableCell>

                  <TableCell sx={tableCss.tableCell}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={entry.status === 'active'}
                          onChange={() => {
                            handleToggleStatus(entry.id, entry.status);
                          }}
                          color={entry.status === 'active' ? 'success' : 'error'}
                        />
                      }
                      label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    />
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={() => {
                          onEdit(entry.id);
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          onDelete(entry.id);
                        }}
                      >
                        <Trash />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      {entries.length > 0 && (
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
          />
        </>
      )}
    </Card>
  );
}
