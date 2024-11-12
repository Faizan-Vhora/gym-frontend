import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import { Avatar, CardHeader, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Clock, ClockUser } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';
import { padding } from '@mui/system';

export interface UserEngagementProps {
  //   diff?: number;
  trend?: 'up' | 'down';
  sx?: SxProps;
}

export function UserEngagement({ sx }: UserEngagementProps): React.JSX.Element {
  const [dailyCheckInCount, setDailyCheckInCount] = React.useState<number | null>(null);
  const [monthlyCheckInCount, setMonthlyCheckInCount] = React.useState<number | null>(null);
  const [weeklyCheckInCount, setWeeklyCheckInCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface UserEngagementResponse {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  }

  React.useEffect(() => {
    const fetchMembershipCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: UserEngagementResponse }>('/deshboard/user-engagement');
        setDailyCheckInCount(response.data.data.dailyActiveUsers);
        setMonthlyCheckInCount(response.data.data.monthlyActiveUsers);
        setWeeklyCheckInCount(response.data.data.weeklyActiveUsers);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMembershipCount();
  }, []);

  return (
    <Card sx={{...sx, padding:'10px 20px'}}>
      <Stack sx={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',}}>
      <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title={'Check Ins'}></CardHeader>
      <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <ClockUser fontSize="var(--icon-fontSize-lg)" /> 

            </Avatar>
      </Stack>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Grid container sx={{ width: '100%',rowGap:'20px',}}>
                <Grid item md={12} xs={12}>
                  <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography
                      sx={{ alignItems: 'center', display: 'flex', columnGap: '5px' }}
                      variant="overline"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                    >
                      <Clock size={20} />{' '}
                      <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                        Daily{' '}
                      </Typography>
                    </Typography>
                    <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {dailyCheckInCount ? dailyCheckInCount : 0}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography
                      sx={{ alignItems: 'center', display: 'flex', columnGap: '5px' }}
                      variant="overline"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                    >
                      <Clock size={20} />{' '}
                      <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                        Weekly{' '}
                      </Typography>
                    </Typography>
                    <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {weeklyCheckInCount ? weeklyCheckInCount : 0}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item md={12} xs={12}>
                  <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography
                      sx={{ alignItems: 'center', display: 'flex', columnGap: '5px' }}
                      variant="overline"
                      style={{ fontFamily: '"Audiowide", sans-serif' }}
                    >
                      <Clock size={20} />
                      <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                        Monthly{' '}
                      </Typography>
                    </Typography>

                    <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {monthlyCheckInCount ? monthlyCheckInCount : 0}
                    </Typography>
                  </Stack>
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
