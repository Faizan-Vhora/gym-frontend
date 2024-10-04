import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
  MenuItem,
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

import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer

import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

import tableCss from '@/styles/table-css';
import { Chat, PencilSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

export interface SupportEntry {
  id: number;
  user: {  id:number, fullName: string; email: string } | null;
  type: 'user' | 'trainer' | 'web';
  status: 'pending' | 'resolved' | 'unresolved';
  userType : '2' | '3';
  subject : string;
  message: string;
  description: string,
  createdAt: Date;
  createdBy: { fullName: string; email: string };
}

interface SupportTableProps {
  entries: SupportEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onUpdateStatus: (id: number, newStatus: SupportEntry['status']) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const typeDictionary = {
  user: 'User',
  trainer: 'Trainer',
  web: 'Web',
};

export function SupportTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onUpdateStatus,
  onPageChange,
  onRowsPerPageChange,
}: SupportTableProps): React.JSX.Element {


  const router = useRouter();

  const handleEdit = React.useCallback(
    (id: string) => {
      router.push(`/dashboard/support/form?id=${id}`);
    },
    [router]
  );

  const handleCheckMessages = React.useCallback(
    (id: string) => {
      router.push(`/dashboard/support/messages?id=${id}`);
    },
    [router]
  );


  const handleStatusChange = (id: number, newStatus: SupportEntry['status']): void => {
    onUpdateStatus(id, newStatus);
    // toast.success('Status updated successfully!'); // Show success toast
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
                <TableCell sx={tableCss.tableHeaderCell}>Subject</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Status</TableCell>
                <TableCell sx={tableCss.tableHeaderCell}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow sx={tableCss.tableRow}>
                  <TableCell sx={tableCss.tableCell} colSpan={5} align="center">
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
                    <TableCell sx={tableCss.tableCell}>{typeDictionary[entry.type]}</TableCell>
                    <TableCell sx={tableCss.tableCell}>{ entry.subject}</TableCell>
                    <TableCell sx={tableCss.tableCell}>
                      <Select
                        sx={{ height: '40px' }}
                        value={entry.status}
                        onChange={(e) => {
                          handleStatusChange(entry.id, e.target.value as SupportEntry['status']);
                        }}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                      </Select>
                    </TableCell>


                    <TableCell sx={tableCss.tableCell}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => {
                            handleEdit(entry.id);
                          }}
                        >
                          <PencilSimple />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            handleCheckMessages(entry.id);
                          }}
                        >
                          <Chat />
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
              count={totalEntries}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, newPage) => {
                onPageChange(newPage);
              }}
              onRowsPerPageChange={(e) => {
                onRowsPerPageChange(parseInt(e.target.value, 10));
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}

      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
