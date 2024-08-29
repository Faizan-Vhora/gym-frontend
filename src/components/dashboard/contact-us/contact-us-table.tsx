import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer

import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

import tableCss from '@/styles/table-css';

export interface ContactUsEntry {
  id: number;
  userDetails: { name: string; email: string };
  from: 'user' | 'trainer' | 'web';
  status: 'pending' | 'resolved' | 'unresolved';
  message: string;
  createdAt: Date;
}

interface ContactUsTableProps {
  entries: ContactUsEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: ContactUsEntry['status']) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export function ContactUsTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onPageChange,
  onRowsPerPageChange,
}: ContactUsTableProps): React.JSX.Element {
  const [selectedEntry, setSelectedEntry] = React.useState<ContactUsEntry | null>(null);

  const handleViewClick = (entry: ContactUsEntry) => {
    setSelectedEntry(entry);
  };

  const handleClose = () => {
    setSelectedEntry(null);
  };

  const handleStatusChange = (id: number, newStatus: ContactUsEntry['status']) => {
    onUpdateStatus(id, newStatus);
    toast.success('Status updated successfully!'); // Show success toast
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>From</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Signed Up</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow sx={tableCss.tableRow}>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow hover key={entry.id} sx={tableCss.tableRow}>
                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{entry.user.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {entry.user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{entry.type}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as ContactUsEntry['status'])}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="unresolved">Unresolved</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={tableCss.tableCell}>{dayjs(entry.createdAt).format('MMM D, YYYY')}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <IconButton onClick={() => handleViewClick(entry)}>
                        <EyeIcon />
                      </IconButton>
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
          count={totalEntries}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25]}
        />

        {selectedEntry && (
          <Modal open onClose={handleClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h6" component="h2">
                Message from {selectedEntry.createdBy.fullName}
              </Typography>
              <Typography sx={{ mt: 2 }}>{selectedEntry.message}</Typography>
              <Box sx={{ mt: 4 }}>
                <Button className="common-button" onClick={handleClose} variant="contained" fullWidth>
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
