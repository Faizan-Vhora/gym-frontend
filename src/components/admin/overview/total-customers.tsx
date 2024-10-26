import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import axiosInstance from '@/lib/axios';

export interface TotalCustomersProps {
  sx?: SxProps;
}

export function TotalCustomers({ sx }: TotalCustomersProps): React.JSX.Element {
  const [totalMembers, setTotalMembers] = React.useState<number | null>(null);
  const [activeMembers, setActiveMembers] = React.useState<number | null>(null);
  const [inActiveMembers, setInActiveMembers] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface TotalCustomerResponse {
    totalMembers: number;
    activeMembers: number;
    inActiveMembers: number;
  }

  React.useEffect(() => {
    const fetchTotalMembers = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: TotalCustomerResponse }>('/deshboard/total-members-count');

        const totalCustomerData = response.data.data;

        setTotalMembers(totalCustomerData.totalMembers);
        setActiveMembers(totalCustomerData.activeMembers);
        setInActiveMembers(totalCustomerData.inActiveMembers);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchTotalMembers();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography style={{ fontFamily: '"Audiowide", sans-serif' }} color="text.secondary" variant="overline">
                Total Members
              </Typography>
              <Typography style={{ fontFamily: '"Audiowide", sans-serif' }} variant="h4">
                {totalMembers ? totalMembers : 0}
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <Grid container>
            <Grid item md={12} xs={12}>
              <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  Active{' '}
                </Typography>
                <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  {activeMembers ? activeMembers : 0}
                </Typography>
              </Stack>
            </Grid>
            <Grid item md={12} xs={12}>
              <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  In Active{' '}
                </Typography>
                <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                  {inActiveMembers ? inActiveMembers : 0}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}
