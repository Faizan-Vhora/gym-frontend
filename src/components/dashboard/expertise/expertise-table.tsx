import React from 'react';
import {
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple, Trash } from '@phosphor-icons/react';

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

  const handleToggleStatus = (id: number, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    onToggleStatus(id, newStatus);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={tableCss.tableRow}>
            <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>

            <TableCell sx={tableCss.tableHeaderCell}>Created At</TableCell>
            <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
            <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
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
                <TableCell sx={tableCss.tableCell}>{entry.title}</TableCell>

                <TableCell sx={tableCss.tableCell}>{formatDate(entry.createdAt)}</TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <IconButton onClick={() => onEdit(entry.id)}>
                    <PencilSimple />
                  </IconButton>
                  <IconButton onClick={() => onDelete(entry.id)}>
                    <Trash />
                  </IconButton>
                </TableCell>
                <TableCell sx={tableCss.tableCell}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={entry.status === 'active'}
                        onChange={() => handleToggleStatus(entry.id, entry.status)}
                        color={entry.status === 'active' ? 'success' : 'error'}
                      />
                    }
                    label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
