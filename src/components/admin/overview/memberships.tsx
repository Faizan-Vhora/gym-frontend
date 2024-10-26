import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import { CardHeader, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import axiosInstance from '@/lib/axios';

export interface MembershipProps {
  //   diff?: number;
  trend?: 'up' | 'down';
  sx?: SxProps;
}

export function Memberships({ sx }: MembershipProps): React.JSX.Element {
  const [totalMembership, setTotalMembership] = React.useState<number | null>(null);
  const [activeMembership, setActiveMembership] = React.useState<number | null>(null);
  const [newMembership, setNewMembership] = React.useState<number | null>(null);
  const [expiredMembership, setExpiredMembership] = React.useState<number | null>(null);
  const [cancelledMembership, setCancelledMembership] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface MembershipCountResponse {
    totalNumberOfMembership: number;
    totalPending: number;
    totalActive: number;
    totalExpired: number;
    totalCancel: number;
  }

  React.useEffect(() => {
    const fetchMembershipCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: MembershipCountResponse }>('/deshboard/membership-count');
        setTotalMembership(response.data.data.totalNumberOfMembership);
        setActiveMembership(response.data.data.totalActive);
        setNewMembership(response.data.data.totalPending);
        setExpiredMembership(response.data.data.totalExpired);
        setCancelledMembership(response.data.data.totalCancel);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMembershipCount();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title={'Memberships'} />
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Grid container>
                <Grid item md={12} xs={12} sx={{ textAlign: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {totalMembership ? totalMembership : 0}
                    </Typography>
                    Total Memberships{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {activeMembership ? activeMembership : 0}
                    </Typography>
                    Active{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {newMembership ? newMembership : 0}
                    </Typography>
                    New{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {expiredMembership ? expiredMembership : 0}
                    </Typography>
                    Expired{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {cancelledMembership ? cancelledMembership : 0}
                    </Typography>
                    Cancelled{' '}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}
