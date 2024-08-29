import React from 'react';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple, Trash } from '@phosphor-icons/react';

interface TrainerTableProps {
  trainers: TrainerEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export interface TrainerEntry {
  id: number;
  trainer_id: string;
  package_name: string;
  package_description: string;
  price: number;
  currency: string;
  duration: Duration;
  status: Status;
}

export enum Duration {
  PerHour = 'Per Hour',
  PerDay = 'Per Day',
  PerWeek = 'Per Week',
  PerMonth = 'Per Month',
  PerYear = 'Per Year',
}

export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  Expired = 'Expired',
}

export function TrainerTable({
  trainers,
  page,
  rowsPerPage,
  totalEntries,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: TrainerTableProps): React.JSX.Element {
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Trainer ID</TableCell>
              <TableCell>Package Name</TableCell>
              <TableCell>Package Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>{trainer.id}</TableCell>
                  <TableCell>{trainer.trainer_id}</TableCell>
                  <TableCell>{trainer.package_name}</TableCell>
                  <TableCell>{trainer.package_description}</TableCell>
                  <TableCell>{trainer.price}</TableCell>
                  <TableCell>{trainer.currency}</TableCell>
                  <TableCell>{trainer.duration}</TableCell>
                  <TableCell>{trainer.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => onEdit(trainer.id)}>
                      <PencilSimple />
                    </IconButton>
                    <IconButton onClick={() => onDelete(trainer.id)}>
                      <Trash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalEntries}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
