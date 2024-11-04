import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

import axiosInstance from '@/lib/axios';

interface User {
  id: number;
  fullName: string;
  email: string;
  profileImageUrl: string;
}

interface MembershipType {
  title: string;
  cost: string;
}

export interface MembershipExpiring {
  id: number;
  expiryDate: string;
  user: User;
  createdAt: string;
  membershipType: MembershipType;
}

export function MembershipExpiring(): React.JSX.Element {
  const [membershipExpiring, setMembershipExpiring] = useState<MembershipExpiring[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleRedirect = (id: number) => {
    router.push(`/admin/customers/form?id=${id}&tab=2`);
  };

  React.useEffect(() => {
    const fetchMembershipExpiring = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: MembershipExpiring[] }>('/deshboard/membership-expirations');
        setMembershipExpiring(response.data.data);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMembershipExpiring();
  }, []);

  return (
    <Card sx={{ height: '520px', overflowY: 'scroll' }}>
      <CardHeader style={{ fontFamily: '"Audiowide", sans-serif !important' }} title="Expiring Memberships" />
      <Divider />
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Membership Expiry</TableCell>
            {/* <TableCell>Expiry Date</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(membershipExpiring) && membershipExpiring.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" style={{ fontFamily: '"Audiowide", sans-serif' }} color="text.secondary">
                  No Memberships with Expiring dates are available
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            Array.isArray(membershipExpiring) &&
            membershipExpiring.map((membership) => (
              <TableRow
                hover
                key={membership?.id}
                onClick={() => {
                  handleRedirect(membership?.user?.id);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ width: '150px' }}>
                  <Typography variant="subtitle1">{membership?.user?.fullName}</Typography>
                  <Typography color="textSecondary" variant="body2">
                    {membership?.user?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">{membership?.membershipType.title}</Typography>
                  <Typography variant="caption">{formatDate(membership?.expiryDate)}</Typography>
                </TableCell>
                {/* <TableCell>
                  <Typography variant="caption">{dayjs(membership?.expiryDate).format('MMM D, YYYY')}</Typography>
                </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {loading && <CustomLoader />}
    </Card>
  );
}
