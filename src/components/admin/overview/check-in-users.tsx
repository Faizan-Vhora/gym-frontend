import * as React from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatTo12HourFormat } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Clock } from '@phosphor-icons/react';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';

import axiosInstance from '@/lib/axios';

import { NoDataPlaceholder } from './no-data-placeholder';

interface User {
  email: string;
  phoneNumber: string;
  fullName: string;
}

export interface CheckIn {
  id: number;
  user: User;
  status: string;
  entryInTime: string;
  entryOutTime: string;
  entryDate: string;
  timezone?: string;
}

// const checkInStatus: Record<string, { label: string; color: 'error' | 'success' }> = {
//   success: { label: 'Success', color: 'success' },
//   failed: { label: 'Failed', color: 'error' },
// };

export function CheckInUsers(): React.JSX.Element {
  const [checkIn, setCheckIn] = React.useState<CheckIn[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  // const handleRedirect = (id: number) => {
  //   router.push(`dashboard/bookings/view?id=${id}`);
  // };

  React.useEffect(() => {
    const fetchCheckIn = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: { items: CheckIn[] } }>('/deshboard/check-in-log');
        setCheckIn(response.data.data.items);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchCheckIn();
  }, []);

  return (
    <Card sx={{ height: '520px', overflowY: 'scroll', overflowX: 'auto' }}>
      <CardHeader style={{ fontFamily: '"Audiowide", sans-serif !important' }} title="User's CheckIn" />

      {Array.isArray(checkIn) && checkIn.length ? (
        <>
          <Divider />
          <Box sx={{}}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>CheckIn Time</TableCell>
                  <TableCell>CheckOut Time</TableCell>
                  {/* <TableCell>Status</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(checkIn) &&
                  checkIn.map((order) => {
                    // const { label, color } = checkInStatus[order.status] ?? { label: 'Unknown', color: 'default' };

                    return (
                      <TableRow
                        hover
                        key={order.id}
                        // onClick={() => {
                        //   handleRedirect(order.id);
                        // }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">{order?.user?.fullName}</Typography>
                          <Typography color="textSecondary" variant="body2">
                            {order?.user?.email}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {order?.user?.phoneNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(order.entryDate)}</TableCell>
                        <TableCell>
                          <IconButton>
                            <Clock />
                          </IconButton>
                          {formatTo12HourFormat(order.entryInTime, order.timezone)}
                        </TableCell>
                        <TableCell>
                          <IconButton>
                            <Clock />
                          </IconButton>
                          {formatTo12HourFormat(order.entryOutTime, order.timezone)}
                        </TableCell>
                        {/* <TableCell>
                          <Chip color={color} label={label} size="small" />
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Box>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button
              color="inherit"
              endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
              size="small"
              variant="text"
              onClick={() => {
                router.push('/admin/check-in');
              }}
            >
              View all
            </Button>
          </CardActions>
        </>
      ) : (
        <></>
      )}

      {!(Array.isArray(checkIn) && checkIn.length) ? <NoDataPlaceholder /> : <></>}

      {loading && <CustomLoader />}
    </Card>
  );
}
