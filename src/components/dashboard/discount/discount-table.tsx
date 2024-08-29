import React from 'react';
import {
  IconButton,
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

interface DiscountTableProps {
  discounts: DiscountEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: DiscountStatus) => void;
  onUsageLimitChange: (id: number, usageLimit: UsageLimit) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export interface DiscountEntry {
  id: number;
  codeName: string;
  expiryDate: string; // Updated from Date to string for API data handling
  discountType: DiscountType;
  usageLimit: UsageLimit;
  discountValue: number;
  description: string;
  status: DiscountStatus;
  isNewUser: boolean;
  discountImage: string;
}

export enum DiscountType {
  Percentage = 'percentage',
  Fix = 'fix',
}

export enum UsageLimit {
  Once = 'once',
  Twice = 'twice',
  NoLimit = 'no_limit',
}

export enum DiscountStatus {
  Active = 'active',
  Inactive = 'inactive',
  Expired = 'expired',
}

export function DiscountTable({
  discounts,
  page,
  rowsPerPage,
  totalEntries,
  onEdit,
  onDelete,
  onStatusChange,
  onUsageLimitChange,
  onPageChange,
  onRowsPerPageChange,
}: DiscountTableProps): React.JSX.Element {
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
              <TableCell>Code Name</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Discount Type</TableCell>
              <TableCell>Usage Limit</TableCell>
              <TableCell>Discount Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>{discount.codeName}</TableCell>
                  <TableCell>{new Date(discount.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{discount.discountType}</TableCell>
                  <TableCell>
                    <Select
                      value={discount.usageLimit}
                      onChange={(e) => onUsageLimitChange(discount.id, e.target.value as UsageLimit)}
                      fullWidth
                    >
                      <MenuItem value={UsageLimit.Once}>Once</MenuItem>
                      <MenuItem value={UsageLimit.Twice}>Twice</MenuItem>
                      <MenuItem value={UsageLimit.NoLimit}>No Limit</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>{discount.discountValue}</TableCell>
                  <TableCell>
                    <Select
                      value={discount.status}
                      onChange={(e) => onStatusChange(discount.id, e.target.value as DiscountStatus)}
                      fullWidth
                    >
                      <MenuItem value={DiscountStatus.Active}>Active</MenuItem>
                      <MenuItem value={DiscountStatus.Inactive}>Inactive</MenuItem>
                      <MenuItem value={DiscountStatus.Expired}>Expired</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => onEdit(discount.id)}>
                      <PencilSimple />
                    </IconButton>
                    <IconButton onClick={() => onDelete(discount.id)}>
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
