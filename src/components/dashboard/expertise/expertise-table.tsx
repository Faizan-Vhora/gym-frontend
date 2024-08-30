import React from 'react';
import {
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple, ToggleLeft, ToggleRight, Trash } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface ExpertiseEntry {
  id: number;
  title: string;
  status: 'active' | 'inactive';
  createdAt: Date | string;
}

interface ExpertiseTableProps {
  entries: ExpertiseEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: 'active' | 'inactive') => void;
}

export function ExpertiseTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onEdit,
  onDelete,
  onToggleStatus,
}: ExpertiseTableProps): React.JSX.Element {
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString();
  };

  const handleToggleStatus = (entry: ExpertiseEntry) => {
    const newStatus = entry.status === 'active' ? 'inactive' : 'active';
    onToggleStatus(entry.id, newStatus);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={tableCss.tableRow}>
            <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>
            <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
            <TableCell sx={tableCss.tableHeaderCell}>Created At</TableCell>
            <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow sx={tableCss.tableRow}>
              <TableCell colSpan={6} align="center" sx={tableCss.tableCell}>
                <Typography variant="body1">No data found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id} sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableCell}>{entry.title}</TableCell>
                <TableCell sx={tableCss.tableCell}>{entry.status === 'active' ? 'Active' : 'Inactive'}</TableCell>
                <TableCell sx={tableCss.tableCell}>{formatDate(entry.createdAt)}</TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <IconButton onClick={() => onEdit(entry.id)}>
                    <PencilSimple />
                  </IconButton>
                  <IconButton onClick={() => onDelete(entry.id)}>
                    <Trash />
                  </IconButton>
                  <IconButton onClick={() => handleToggleStatus(entry)}>
                    {entry.status === 'active' ? <ToggleRight /> : <ToggleLeft />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
