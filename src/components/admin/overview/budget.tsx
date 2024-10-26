import * as React from 'react';
import { formatDashboardAmount } from '@/utils/converter';
import { CustomLoader } from '@/utils/loader';
import { Avatar, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CurrencyDollar } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';

export interface BudgetProps {
  diff?: number;
  trend?: 'up' | 'down';
  sx?: SxProps;
}

export function Budget({ sx }: BudgetProps): React.JSX.Element {
  const [totalRevenue, setTotalRevenue] = React.useState<number | null>(null);
  const [fromMemberships, setFromMemberships] = React.useState<number | null>(null);
  const [fromSessions, setFromSessions] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface RevenueResponse {
    bookingRevenue: number;
    membershipRevenue: number;
    totalRevenue: number;
  }

  React.useEffect(() => {
    const fetchRevenueCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: RevenueResponse }>('/deshboard/revenue-statistics');
        setTotalRevenue(response.data.data.totalRevenue);
        setFromMemberships(response.data.data.membershipRevenue);
        setFromSessions(response.data.data.bookingRevenue);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchRevenueCount();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography style={{ fontFamily: '"Audiowide", sans-serif' }} color="text.secondary" variant="overline">
                Revenue
              </Typography>
              <Typography variant="h4" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                {totalRevenue ? formatDashboardAmount(totalRevenue) : 0}
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <CurrencyDollar fontSize="var(--icon-fontSize-lg)" />
            </Avatar>

            {/* <HandCoins fontSize="var(--icon-fontSize-lg)" /> */}
          </Stack>
          <Grid container>
            <Grid item md={12} xs={12}>
              <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  FROM MEMBERSHIPS{' '}
                </Typography>
                <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  {formatDashboardAmount(fromMemberships)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item md={12} xs={12}>
              <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  FROM SESSIONS{' '}
                </Typography>
                <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  {formatDashboardAmount(fromSessions)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          {/* {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography style={{ fontFamily: '"Audiowide", sans-serif' }} color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null} */}
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}
