'use client';

import * as React from 'react';
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
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { PencilSimple, ToggleLeft, ToggleRight, Trash } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

const statusOptions = ['Active', 'Inactive', 'Archived']; // Add more status options if needed

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
}: FaqTableProps) {
  const handleRequestSort = (property: keyof FaqEntry) => {
    // Add sorting functionality here if needed
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      onDelete(id);
    }
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel onClick={() => handleRequestSort('type')}>Type</TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel onClick={() => handleRequestSort('question')}>Question</TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel onClick={() => handleRequestSort('answer')}>Answer</TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>
                <TableSortLabel onClick={() => handleRequestSort('status')}>Status</TableSortLabel>
              </TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqs.map((faq) => (
              <TableRow key={faq.id} sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableCell}>{faq.type}</TableCell>
                <TableCell sx={tableCss.tableCell}>{faq.question}</TableCell>
                <TableCell sx={tableCss.tableCell}>{faq.answer}</TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <Select
                    value={faq.status}
                    onChange={(e) => onStatusChange(faq.id, e.target.value as FaqStatus)}
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
                  <IconButton onClick={() => onEdit(faq.id)}>
                    <PencilSimple />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(faq.id)}>
                    <Trash />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalEntries}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => {
          onRowsPerPageChange(parseInt(event.target.value, 10));
        }}
      />
    </Card>
  );
}
