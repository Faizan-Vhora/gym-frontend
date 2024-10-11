import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { PencilSimple, Trash } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

const statusOptions = ['Active', 'Inactive', 'Archived'];

export interface FaqEntry {
  id: number;
  type: FaqType;
  question: string;
  answer: string;
  status: FaqStatus;
  createdAt?: Date;
}

export enum FaqType {
  General = 'general',
  User = 'user',
  Trainer = 'trainer',
}

export enum FaqStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
}

interface FaqTableProps {
  faqs: FaqEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: FaqStatus) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export default function FaqTable({
  faqs,
  page,
  rowsPerPage,
  totalEntries,
  onEdit,
  onDelete,
  onStatusChange,
  onPageChange,
  onRowsPerPageChange,
}: FaqTableProps): React.JSX.Element {
  const router = useRouter();

  const handleRequestSort = (_property: keyof FaqEntry): void => {
    // Function body remains empty or contains code not using _property
  };

  const typeMappings: Record<string, string> = {
    general: 'General',
    user: 'User',
    trainer: 'Trainer',
    // Add other mappings as needed
  };

  const handleRowClick = (id: number): void => {
    router.push(`/dashboard/faq/form?id=${id}`); // Replace with the actual path to your form page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel
                  onClick={() => {
                    handleRequestSort('type');
                  }}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel
                  onClick={() => {
                    handleRequestSort('question');
                  }}
                >
                  Question
                </TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel
                  onClick={() => {
                    handleRequestSort('answer');
                  }}
                >
                  Answer
                </TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel
                  onClick={() => {
                    handleRequestSort('status');
                  }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow sx={tableCss.tableRow}>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id} sx={tableCss.tableRow}>
                  <TableCell
                    sx={tableCss.tableCell}
                    onClick={() => {
                      handleRowClick(faq.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {typeMappings[faq.type.toLowerCase()] || faq.type}
                    {/* Fallback to original type if it's not in the mapping */}
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>{faq.question}</TableCell>
                  <TableCell sx={tableCss.tableCell}>{faq.answer}</TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    <Select
                      sx={{ height: '40px', width: '120px' }}
                      value={faq.status}
                      onChange={(e) => {
                        onStatusChange(faq.id, e.target.value as FaqStatus);
                      }}
                      fullWidth
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status.toLowerCase()}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={tableCss.tableCell}>
                    <IconButton
                      onClick={() => {
                        onEdit(faq.id);
                      }}
                    >
                      <PencilSimple />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        onDelete(faq.id);
                      }}
                    >
                      <Trash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      {faqs.length > 0 && (
        <>
          <Divider />
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalEntries}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => {
              onPageChange(newPage);
            }}
            onRowsPerPageChange={(event) => {
              onRowsPerPageChange(parseInt(event.target.value, 10));
            }}
          />
        </>
      )}
    </Card>
  );
}
