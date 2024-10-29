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
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import axiosInstance from '@/lib/axios';
import { NoSsr } from '@/components/core/no-ssr';

// const lines = [
//   { name: 'New customers', dataKey: 'v1', color: 'var(--mui-palette-primary-main)' },
//   { name: 'Up & cross selling', dataKey: 'v2', color: 'var(--mui-palette-success-main)' },
// ] satisfies { name: string; dataKey: string; color: string }[];

// export interface StatsProps {
//   data: { name: string; v1: number; v2: number }[];
// }

interface BarLine {
  name: string;
  dataKey: string;
  color: string;
}

interface DataPoint {
  name: string;
  [key: string]: number | string; // To accommodate dynamic keys like v1, v2, etc.
}

// Refactored using Record and the preferred array syntax
type YearlyMembershipData = Record<
  string,
  {
    data: { membershipType: string; membershipCount: number }[];
  }
>;

export function MembershipGrowth(): React.JSX.Element {
  const chartHeight = 320;
  const [loading, setLoading] = React.useState(false);
  const [barLines, setBarLines] = React.useState<BarLine[]>([]);
  const [data, setData] = React.useState<DataPoint[]>([]);

  React.useEffect(() => {
    const fetchMembershipGrowthCount = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: YearlyMembershipData }>('/deshboard/membership-growth');
        const yearlyData = response.data.data;

        const uniqueMembershipTypes = new Set<string>();

        // Collect unique membership types across all months
        Object.keys(yearlyData).forEach((monthKey) => {
          yearlyData[monthKey].data.forEach((membership) => {
            uniqueMembershipTypes.add(membership.membershipType);
          });
        });

        const getRandomColor = (): string => {
          const randomColor = Math.floor(Math.random() * 16777215).toString(16); // Generate a random number and convert it to hexadecimal
          return `#${randomColor.padStart(6, '0')}`; // Ensure it's a 6-digit hex color
        };

        // Define fixed colors: blue, red, green, and primary
        const fixedColors = ['#009596', '#3C3D99', '#004B95', '#23511E', '#7D1007'];

        // Dynamically create `barLines` for each unique membership type
        const newBarLines: BarLine[] = Array.from(uniqueMembershipTypes).map((membershipType, index) => ({
          name: membershipType,
          dataKey: `v${index + 1}`, // Dynamically set keys as v1, v2, etc.
          color: index < fixedColors.length ? fixedColors[index] : getRandomColor(), // Use fixed colors for the first few entries
        }));

        setBarLines(newBarLines);

        // Generate `data` array by iterating over `YearlyMembershipData`
        const newData: DataPoint[] = Object.keys(yearlyData).map((monthKey) => {
          // No need for type assertion here
          const monthlyData = yearlyData[monthKey];

          // Create a data point with the formatted month name
          const dataPoint: DataPoint = {
            name: monthKey.charAt(0).toUpperCase() + monthKey.slice(1), // Format month name
          };

          // Populate v1, v2, etc., based on `barLines`
          newBarLines.forEach((barLine, index) => {
            // Find the membership data for the current barLine
            const membershipData = monthlyData.data.find((m) => m.membershipType === barLine.name);
            // Add the membership count or 0 if not found
            dataPoint[`v${index + 1}`] = membershipData ? membershipData.membershipCount : 0;
          });

          return dataPoint;
        });

        setData(newData);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMembershipGrowthCount();
  }, []);

  return (
    <Card>
      <CardHeader title="Membership Growth" />
      <CardContent>
        <Stack divider={<Divider />} spacing={3}>
          <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
            <ResponsiveContainer height={chartHeight} width="100%">
              <LineChart data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} />
                <XAxis axisLine={false} dataKey="name" interval={4} tickLine={false} type="category" />
                {/* Dynamically generate Y-Axis */}
                {barLines.map((barLine) => (
                  <YAxis
                    key={barLine.dataKey}
                    axisLine={false}
                    domain={[0, 'dataMax + 10']} // Set appropriate domain based on your data
                    hide
                    type="number"
                    yAxisId={barLine.dataKey}
                  />
                ))}
                {barLines.map((barLine) => (
                  <Line
                    key={barLine.name}
                    animationDuration={300}
                    dataKey={barLine.dataKey} // Access the correct dataKey for each barLine
                    dot={<Dot />}
                    name={barLine.name}
                    stroke={barLine.color}
                    strokeDasharray="0"
                    strokeWidth={2}
                    type="bump"
                    yAxisId={barLine.dataKey} // Ensure it matches the yAxisId defined above
                  />
                ))}
                <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
              </LineChart>
            </ResponsiveContainer>
          </NoSsr>
          <Legend barLines={barLines} />
        </Stack>
      </CardContent>
      {loading && <CustomLoader />}
    </Card>
  );
}

interface DotProps {
  hover?: boolean;
  active?: string;
  cx?: number;
  cy?: number;
  payload?: { name: string };
  stroke?: string;
}

function Dot({ active, cx, cy, payload, stroke }: DotProps): React.JSX.Element | null {
  if (active && payload?.name === active) {
    return <circle cx={cx} cy={cy} fill={stroke} r={6} />;
  }

  return null;
}

function Legend({ barLines }: { barLines: BarLine[] }): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      {barLines.map((barLine) => (
        <Stack direction="row" key={barLine.name} spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ bgcolor: barLine.color, borderRadius: '2px', height: '4px', width: '16px' }} />
          <Typography color="text.secondary" variant="caption">
            {barLine.name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
interface TooltipContentProps {
  active?: boolean;
  payload?: { name: string; dataKey: string; value: number; stroke: string }[];
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
                <Box sx={{ bgcolor: entry.stroke, borderRadius: '2px', height: '8px', width: '8px' }} />
                <Typography sx={{ whiteSpace: 'nowrap' }}>{entry.name}</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {entry.value} {/* Display value directly without formatting */}
              </Typography>
            </Stack>
          )
        )}
      </Stack>
    </Paper>
  );
}
