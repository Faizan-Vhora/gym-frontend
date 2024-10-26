import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import { CardHeader, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import axiosInstance from '@/lib/axios';

export interface TrainerUtilizationProps {
  //   diff?: number;
  trend?: 'up' | 'down';
  sx?: SxProps;
}

export function TrainerUtitlization({ sx }: TrainerUtilizationProps): React.JSX.Element {
  const [totalSessionsConducted, setTotalSessionsConducted] = React.useState<number | null>(null);
  const [totalSessions, setTotalSessions] = React.useState<number | null>(null);
  const [onGoingSessions, setOnGoingSessions] = React.useState<number | null>(null);
  const [upComingSessions, setUpComingSessions] = React.useState<number | null>(null);
  const [cancelledSessions, setCancelledSessions] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface TrainerUtitlizationResponse {
    totalSessions: number;
    incomingSessions: number;
    startedSessions: number;
    completedSessions: number;
    cancelledSessions: number;
  }

  React.useEffect(() => {
    const fetchTrainerUtilizationCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: TrainerUtitlizationResponse }>(
          '/deshboard/trainer-utilization'
        );
        setTotalSessionsConducted(response.data.data.completedSessions);
        setTotalSessions(response.data.data.totalSessions);
        setOnGoingSessions(response.data.data.startedSessions);
        setUpComingSessions(response.data.data.incomingSessions);
        setCancelledSessions(response.data.data.cancelledSessions);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchTrainerUtilizationCount();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title={'Sessions'} />
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Grid container>
                <Grid item md={12} xs={12} sx={{ textAlign: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {totalSessions ? totalSessions : 0}
                    </Typography>
                    Total Sessions{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {upComingSessions ? upComingSessions : 0}
                    </Typography>
                    UpComing{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {totalSessionsConducted ? totalSessionsConducted : 0}
                    </Typography>
                    Conducted{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {onGoingSessions ? onGoingSessions : 0}
                    </Typography>
                    OnGoing{' '}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={12} sx={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Typography variant="overline" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: '"Audiowide", sans-serif' }}>
                      {cancelledSessions ? cancelledSessions : 0}
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
