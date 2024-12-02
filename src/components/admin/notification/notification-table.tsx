import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  // Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  // Tooltip,
  Typography,
} from '@mui/material';
import { ToastContainer } from 'react-toastify'; // Import toast and ToastContainer

import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date-utils';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
// import { Trash } from '@phosphor-icons/react';

import tableCss from '@/styles/table-css';

export interface NotificationEntry {
  id: number;
  title: string;
  message: string;
  notificationType: number;
  isRead: boolean;
  createdAt: string; // Use Date type if you'll be converting this to a Date object
  updatedAt: string; // Use Date type if you'll be converting this to a Date object
  user: {
    id: number;
    memberId: string;
    fullName: string;
    email: string;
    profileImageUrl: string | null;
    qrCodeImageUrl: string | null;
    userType?: number;
  };
  redirectionPath: string | null;
}

interface NotificationTableProps {
  entries: NotificationEntry[];
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NotificationTable({
  entries,
  page,
  rowsPerPage,
  totalEntries,
  onPageChange,
  onRowsPerPageChange,
}: NotificationTableProps): React.JSX.Element {
  const [selectedEntry, setSelectedEntry] = React.useState<NotificationEntry | null>(null);
  const router = useRouter();
  // const stripHtml = (html: string): string => {
  //   const div = document.createElement('div');
  //   div.innerHTML = html;
  //   return div.textContent || div.innerText || '';
  // };

  const handleread = async (entry: NotificationEntry) => {
    if (!entry) return;

    const payload = {
      isRead: true,
    };

    try {
      await axiosInstance.patch(`/notification/${entry.id}`, payload);
      // You can update the chip's state or entry state here if needed
    } catch (error) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
      await Swal.fire('Error!', 'Failed to mark notification as read.', 'error');
    }
  };

  // useEffect to handle calling `handleread` when `selectedEntry` changes
  React.useEffect(() => {
    if (selectedEntry) {
      void handleread(selectedEntry);
      // Update chip or UI state here as needed
    }
  }, [selectedEntry]);

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={tableCss.tableRow}>
                <TableCell sx={tableCss.tableHeaderCell}>User Details</TableCell>
                {/* <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Title</TableCell> */}
                <TableCell sx={tableCss.tableHeaderCell}>Message</TableCell>
                <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Created At</TableCell>
                {/* <TableCell sx={{ ...tableCss.tableHeaderCell, textAlign: 'center' }}>Is Read</TableCell> */}
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow sx={{ ...tableCss.tableRow, fontWeight: 'bold' }}>
                  <TableCell sx={tableCss.tableCell} colSpan={5} align="center">
                    <Typography variant="body1">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow hover key={entry.id} sx={{ ...tableCss.tableRow, fontWeight: 'bold' }}>
                    <TableCell
                      sx={{
                        ...tableCss.tableCell,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '150px',
                      }}
                      onClick={() => {
                        setSelectedEntry(entry);
                        if (entry?.user?.userType === 3) {
                          router.push(`/admin/customers/form?id=${entry?.user?.id}&tab=1`);
                        } else if (entry?.user?.userType === 2) {
                          router.push(`/admin/trainers/form?id=${entry?.user?.id}&tab=1`);
                        }
                      }}
                    >
                      <Stack flexDirection={'row'} columnGap={2} paddingY={1}>
                        <Avatar
                          src={entry?.user?.profileImageUrl || '/assets/User@3x-1.png'}
                          sx={{ height: '56px', width: '56px' }}
                        />
                        <Stack>
                          <Typography variant="subtitle2" sx={{ fontWeight: entry.isRead ? 'normal' : 'bold' }}>
                            {entry.user?.fullName}
                          </Typography>
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ fontWeight: entry.isRead ? 'normal' : 'bold' }}
                          >
                            {entry.user?.email}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: '80px !important',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis !important',
                        textAlign: 'left',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: entry.isRead ? 'normal' : 'bold' }}>
                        {entry?.title}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="body2"
                        sx={{ fontWeight: entry.isRead ? 'normal' : 'bold' }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: entry?.message }} />
                      </Typography>

                      {/* {entry?.title} */}
                    </TableCell>
                    {/* <TableCell
                      sx={{
                        ...tableCss.tableCell,
                        maxWidth: '80px !important',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis !important',
                        textAlign: 'left',
                      }}
                    >
                      <Tooltip title={stripHtml(entry?.message) || ''} arrow>
                        <span dangerouslySetInnerHTML={{ __html: entry?.message }} />
                      </Tooltip>
                    </TableCell> */}

                    <TableCell sx={tableCss.tableCell}>
                      {entry.createdAt && (
                        <Typography color="textSecondary" sx={{ fontWeight: entry.isRead ? 'normal' : 'bold' }}>
                          {formatDate(entry.createdAt)}
                        </Typography>
                      )}
                    </TableCell>
                    {/* <TableCell sx={tableCss.tableCell}>
                      <Chip
                        label={entry.isRead ? 'Readed' : 'Unread'}
                        color={entry.isRead ? 'default' : 'success'}
                        variant="outlined"
                      />
                    </TableCell> */}
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
              onRowsPerPageChange={(event) => {
                const inputEvent = event as React.ChangeEvent<HTMLInputElement>;
                onRowsPerPageChange(inputEvent);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={'Records per page'}
            />
          </>
        )}
      </Card>
      <ToastContainer /> {/* Add ToastContainer to your component tree */}
    </>
  );
}
