'use client';

import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Wallet as WalletIcon } from '@phosphor-icons/react/dist/ssr/Wallet';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import axiosInstance from '@/lib/axios';
import { NoSsr } from '@/components/core/no-ssr';

// export interface CostBreakdownProps {
//   data: { name: string; value: number; color: string }[];
// }

interface RevenueBreakDown {
  name: string;
  value: number;
  color: string;
}

export function CostBreakdown(): React.JSX.Element {
  const chartSize = 200;
  const chartTickness = 30;
  const [data, setData] = React.useState<RevenueBreakDown[] | undefined>(undefined);
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

        const formattedData = [
          //   {
          //     name: 'Total Revenue',
          //     value: response.data.data.totalRevenue,
          //     color: 'var(--mui-palette-success-main)',
          //   },
          {
            name: 'Booking Revenue',
            value: response.data.data.bookingRevenue,
            color: 'var(--mui-palette-warning-main)',
          },
          {
            name: 'Membership Revenue',
            value: response.data.data.membershipRevenue,
            color: 'var(--mui-palette-primary-main)',
          },
        ];

        setData(formattedData);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchRevenueCount();
  }, []);
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <WalletIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title="Revenue breakdown"
      />
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <NoSsr fallback={<Box sx={{ height: `${chartSize}px`, width: `${chartSize}px` }} />}>
              <PieChart height={chartSize} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} width={chartSize}>
                <Pie
                  animationDuration={300}
                  cx={chartSize / 2}
                  cy={chartSize / 2}
                  data={data}
                  dataKey="value"
                  innerRadius={chartSize / 2 - chartTickness}
                  nameKey="name"
                  outerRadius={chartSize / 2}
                  strokeWidth={0}
                >
                  {data?.map((entry): React.JSX.Element => <Cell fill={entry.color} key={entry.name} />)}
                </Pie>
                <Tooltip animationDuration={50} content={<TooltipContent />} />
              </PieChart>
            </NoSsr>
          </Box>
          <Legend payload={data} />
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}

interface LegendProps {
  payload?: RevenueBreakDown[] | null;
}

function Legend({ payload }: LegendProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
      {payload?.map(
        (entry, index): React.JSX.Element => (
          <Box
            key={entry.name}
            sx={{ alignItems: index % 2 === 0 ? 'flex-start' : 'flex-end', display: 'flex', flexDirection: 'column' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: entry.color, borderRadius: '2px', height: '4px', width: '16px' }} />
              <Typography variant="body2">{entry.name}</Typography>
            </Stack>
            <Typography variant="h5">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                entry.value
              )}
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
}

interface TooltipContentProps {
  active?: boolean;
  payload?: { name: string; payload: { fill: string }; value: number }[];
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
                <Box sx={{ bgcolor: entry.payload.fill, borderRadius: '2px', height: '8px', width: '8px' }} />
                <Typography sx={{ whiteSpace: 'nowrap' }}>{entry.name}</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(entry.value)}
              </Typography>
            </Stack>
          )
        )}
      </Stack>
    </Paper>
  );
}
