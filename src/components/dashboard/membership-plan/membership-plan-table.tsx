import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getStatusStringText, UserStatusString } from '@/utils/userstatus';
import {
  Box,
  // Button,
  Card,
  // Dialog,
  // DialogActions,
  // DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { CurrencyDollar, PencilSimple, Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import tableCss from '@/styles/table-css';

export interface MembershipPlans {
  id: string;
  title: string;
  cost: number;
  durationInMonths: number;
  expiryDate: Date;
  paymentFrequency: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: string;
}

const formatPaymentFrequency = (value: string | undefined): string => {
  const formattedValue = value?.toLowerCase();

  if (formattedValue === 'yearly') {
    return 'Yearly';
  }
  if (formattedValue === 'monthly') {
    return 'Monthly';
  }
  return ''; // Return empty string or any default value if not 'yearly' or 'monthly'
};

interface MembershipPlanTableProps {
  count: number;
  page: number;
  rowsPerPage: number;
  rows: MembershipPlans[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updatePlanStatus: (id: string, currentStatus: string) => void; // Added prop
}

export function MembershipPlanTable({
  count,
  page,
  rowsPerPage,
  rows,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  updatePlanStatus, // Added prop
}: MembershipPlanTableProps): React.JSX.Element {
  const router = useRouter();
  // const [open, setOpen] = React.useState(false);
  // const [selectedImage, setSelectedImage] = React.useState('');

  const handleRowClick = (id: string): void => {
    router.push(`/dashboard/membership-plan/form?id=${id}`); // Replace with the actual path to your form page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableCss.tableRow}>
              <TableCell sx={tableCss.tableHeaderCell}>Title</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Cost</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Duration</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Payment Frequency</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Description</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Update At</TableCell>
              <TableCell sx={tableCss.tableHeaderCell}>Action</TableCell>
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
                        style={{ cursor: 'pointer' }}
                      >
                        {row.title}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <CurrencyDollar />
                      {row.cost}
                    </TableCell>

                    <TableCell sx={tableCss.tableCell}>{row.durationInMonths} months</TableCell>
                    <TableCell sx={tableCss.tableCell}>{formatPaymentFrequency(row.paymentFrequency)}</TableCell>
                    <TableCell sx={[tableCss.tableCell,{ textOverflow: 'ellipsis !important',maxWidth: '120px !important',overflow:'hidden'}]}>{row.description}</TableCell>

                    <TableCell sx={tableCss.tableCell}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={row.status === 'active'}
                            onChange={(event) => {
                              event.stopPropagation();
                              updatePlanStatus(row.id, row.status);
                            }}
                            color={row.status === 'active' ? 'success' : 'error'}
                          />
                        }
                        label={getStatusStringText(row.status as UserStatusString)}
                      />
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{dayjs(row.updatedAt).format('MMM D, YYYY')}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <IconButton
                        onClick={() => {
                          onEdit(row.id);
                        }}
                      >
                        <PencilSimple />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          onDelete(row.id);
                        }}
                      >
                        <Trash />
                      </IconButton>
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

      {/* Modal for QR Code Preview */}
      {/* <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent>
              <img src={selectedImage} alt="QR Code" style={{ width: '50%', height: 'auto', objectFit: 'contain' }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog> */}
    </Card>
  );
}
