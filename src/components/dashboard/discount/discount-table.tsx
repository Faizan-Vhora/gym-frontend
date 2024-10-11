import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
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
  Typography,
} from '@mui/material';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

interface DiscountTableProps {
  discounts: DiscountEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: DiscountStatus) => void;
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
  discountImageUrl?: string;
  discountImage?: string;
}

export enum DiscountType {
  Percentage = 'percentage',
  Fix = 'fixed',
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
  onPageChange,
  onRowsPerPageChange,
}: DiscountTableProps): React.JSX.Element {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleChangePage = (event: unknown, newPage: number): void => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const handleAvatarClick = (imageUrl: string): void => {
    setSelectedImage(imageUrl);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedImage(null);
  };

  const handleRowClick = (id: number): void => {
    router.push(`/dashboard/discount/form?id=${id}`); // Replace with the actual path to your form page
  };

  const usageLimitDisplay: Record<UsageLimit, string> = {
    [UsageLimit.Once]: 'Once',
    [UsageLimit.Twice]: 'Twice',
    [UsageLimit.NoLimit]: 'No Limit',
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>Discount Image</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Code Name</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Expiry Date</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Discount Type</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Usage Limit</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Discount Value</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.length === 0 ? (
                <TableRow sx={tableCss.tableRow}>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((discount) => (
                  <TableRow key={discount.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Image
                        src={discount?.discountImageUrl || '/assets/logo.svg'}
                        alt="Discount Preview"
                        width={50}
                        height={50}
                        style={{}}
                        onClick={() => {
                          handleAvatarClick(discount.discountImageUrl || '');
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={tableCss.tableCell}
                      onClick={() => {
                        handleRowClick(discount.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {discount.codeName}
                    </TableCell>
                    <TableCell sx={[tableCss.tableCell, { whiteSpace: 'nowrap' }]}>
                      {dayjs(discount.expiryDate).format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {discount.discountType === DiscountType.Percentage ? 'Percentage' : 'Fixed'}
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{usageLimitDisplay[discount.usageLimit]}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      {discount.discountType === DiscountType.Percentage
                        ? `${Math.floor(discount.discountValue)}%` // Remove decimal points and display percentage
                        : `$${discount.discountValue}`}{' '}
                    </TableCell>
                    <TableCell>
                      <Select
                        sx={{ height: '40px', width: '120px' }}
                        value={discount.status}
                        onChange={(e) => {
                          onStatusChange(discount.id, e.target.value as DiscountStatus);
                        }}
                        fullWidth
                      >
                        <MenuItem value={DiscountStatus.Active}>Active</MenuItem>
                        <MenuItem value={DiscountStatus.Inactive}>Inactive</MenuItem>
                        <MenuItem value={DiscountStatus.Expired}>Expired</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <IconButton
                        onClick={() => {
                          onEdit(discount.id);
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          onDelete(discount.id);
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
        {discounts.length > 0 && (
          <>
            <Divider />
            <TablePagination
              component="div"
              count={totalEntries}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>

      {/* Dialog for image preview */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {selectedImage ? (
            <img src={selectedImage} alt="" style={{ width: '100%', height: 'auto' }} />
          ) : (
            <p>No image selected</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
