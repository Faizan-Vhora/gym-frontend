'use client';

import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import axiosInstance from '@/lib/axios';
import { NoSsr } from '@/components/core/no-ssr';

const bars = [
  { name: 'Total Sessions', dataKey: 'totalCount', color: 'var(--mui-palette-primary-400)' },
  { name: 'Attended Sessions', dataKey: 'completedSession', color: 'var(--mui-palette-primary-600)' },
] satisfies { name: string; dataKey: string; color: string }[];

interface TrainerSessionsConductedResponse {
  name: string;
  totalCount: number;
  completedSession: number;
}
export function TrainerSessionsConducted(): React.JSX.Element {
  const chartHeight = 300;
  const [data, setData] = React.useState<TrainerSessionsConductedResponse[] | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchTrainerUtilizationCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: TrainerSessionsConductedResponse[] }>(
          '/deshboard/trainer-sessions-conducted'
        );
        setData(response.data.data);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchTrainerUtilizationCount();
  }, []);

  return (
    <Card>
      <CardHeader title="Trainer Sessions Conducted" />
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          {/* <Stack spacing={3} sx={{ flex: '0 0 auto', justifyContent: 'space-between', width: '240px' }}>
            <Stack spacing={2}>
              <Typography color="success.main" variant="h2">
                +28%
              </Typography>
              <Typography color="text.secondary">
                increase in app usage with{' '}
                <Typography color="text.primary" component="span">
                  6,521
                </Typography>{' '}
                new products purchased
              </Typography>
            </Stack>
            <div>
              <Typography color="text.secondary" variant="body2">
                <Typography color="primary.main" component="span" variant="subtitle2">
                  This year
                </Typography>{' '}
                is forecasted to increase in your traffic by the end of the current month
              </Typography>
            </div>
          </Stack> */}
          <Stack divider={<Divider />} spacing={2} sx={{ flex: '1 1 auto' }}>
            <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
              <ResponsiveContainer height={chartHeight}>
                <BarChart barGap={-32} data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="name" tickLine={false} type="category" xAxisId={0} />
                  <XAxis axisLine={false} dataKey="name" hide type="category" xAxisId={1} />
                  <YAxis axisLine={false} domain={[0, 50]} hide tickCount={6} type="number" />
                  {bars.map(
                    (bar, index): React.JSX.Element => (
                      <Bar
                        animationDuration={300}
                        barSize={32}
                        dataKey={bar.dataKey}
                        fill={bar.color}
                        key={bar.name}
                        name={bar.name}
                        radius={[5, 5, 5, 5]}
                        xAxisId={index}
                      />
                    )
                  )}
                  <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
                </BarChart>
              </ResponsiveContainer>
            </NoSsr>
            <Legend />
          </Stack>
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}

function Legend(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      {bars.map((bar) => (
        <Stack direction="row" key={bar.name} spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ bgcolor: bar.color, borderRadius: '2px', height: '4px', width: '16px' }} />
          <Typography color="text.secondary" variant="caption">
            {bar.name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

interface TooltipContentProps {
  active?: boolean;
  payload?: { fill: string; name: string; dataKey: string; value: number }[];
  label?: string;
}

function TooltipContent({ active, payload }: TooltipContentProps): React.JSX.Element | null {
  if (!active) {
    return null;
  }

  return (
    <Paper sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'var(--mui-shadows-16)', p: 1 }}>
      <Stack spacing={2}>
        {payload?.map(
          (entry): React.JSX.Element => (
            <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
                <Box sx={{ bgcolor: entry.fill, borderRadius: '2px', height: '8px', width: '8px' }} />
                <Typography sx={{ whiteSpace: 'nowrap' }}>{entry.name}</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {new Intl.NumberFormat('en-US').format(entry.value)}
              </Typography>
            </Stack>
          )
        )}
      </Stack>
    </Paper>
  );
}
