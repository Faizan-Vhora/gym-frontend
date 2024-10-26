// 'use client';

// import * as React from 'react';
// import Avatar from '@mui/material/Avatar';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
// import Divider from '@mui/material/Divider';
// import Paper from '@mui/material/Paper';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import type { Icon } from '@phosphor-icons/react/dist/lib/types';
// import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// import axiosInstance from '@/lib/axios';
// import { NoSsr } from '@/components/core/no-ssr';

// var barLines = [
//   { name: 'Gold', dataKey: 'gold', color: 'var(--mui-palette-primary-main)' },
//   { name: 'Starter', dataKey: 'starter', color: 'var(--mui-palette-primary-main)' },
// ] satisfies { name: string; dataKey: string; color: string }[];

// // export interface StatsProps {
// //   data: { name: string; v1: number; v2: number }[];
// // }

// interface CheckInBarChartResponse {
//   name: string;
//   checkInCount: number;
// }

// export function Stats(): React.JSX.Element {
//   // { data }: StatsProps
//   const chartHeight = 320;

//   const [loading, setLoading] = React.useState(false);

//   const [barChartData, setBarChartData] = React.useState([
//     // { name: 'Jan 1', v1: 35, v2: 3350 },
//     // { name: 'Jan 2', v1: 41, v2: 3440 },
//     // { name: 'Jan 2', v1: 32, v2: 3054 },
//     // { name: 'Jan 3', v1: 34, v2: 3780 },
//     // { name: 'Jan 4', v1: 53, v2: 3849 },
//     // { name: 'Jan 5', v1: 48, v2: 4241 },
//     // { name: 'Jan 6', v1: 59, v2: 4170 },
//   ]);

//   React.useEffect(() => {
//     const fetchMembershipGrowthCount = async (): Promise<void> => {
//       setLoading(true);
//       try {
//         const response = await axiosInstance.get<{ data: CheckInBarChartResponse[] }>('/deshboard/membership-growth');

//         console.log('***response.data.data: ', response.data.data);

//         let tempData: any = [];

//         let tempBarChart: any = [];

//         Object.keys(response.data.data).forEach((key: any) => {
//           const monthData: any = response.data.data[key];

//           console.log('***monthData: ', monthData);

//           let monthBarLineData: any = {};

//           monthBarLineData.name = monthData.label;

//           monthData.data.forEach((ele: any) => {
//             monthBarLineData[ele.membershipTypeKey] = ele.membershipCount;
//           });

//           tempData.push(monthBarLineData);

//           if (!tempBarChart.length) {
//             monthData.data.forEach((ele: any) => {
//               tempBarChart.push({
//                 name: ele.membershipType,
//                 dataKey: ele.membershipTypeKey,
//                 color: 'var(--mui-palette-primary-main)',
//               });
//             });
//           }
//         });

//         console.log('***tempData: ', tempData);

//         barLines = tempBarChart;

//         console.log('***barLines: ', barLines);

//         setBarChartData(tempData);

//         // setData(response.data.data);
//       } catch (error) {
//         error instanceof Error ? error.message : 'An unexpected error occurred';
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchMembershipGrowthCount();
//   }, []);

//   return (
//     <Card>
//       <CardHeader title="Stats at a glance" />
//       <CardContent>
//         <Stack divider={<Divider />} spacing={3}>
//           {/* <Stack
//             direction={{ xs: 'column', md: 'row' }}
//             divider={<Divider flexItem orientation="vertical" sx={{ borderBottomWidth: { xs: '1px', md: 0 } }} />}
//             spacing={3}
//             sx={{ justifyContent: 'space-between' }}
//           >
//             <Summary icon={ChartPieIcon} title="Payout balance" value={16400} />
//             <Summary icon={CurrencyDollarIcon} title="Today's revenue" value={2600} />
//             <Summary icon={ReceiptIcon} title="Expenses" value={5800} />
//             <Summary icon={ReceiptXIcon} title="Refunds" value={1250} />
//           </Stack> */}
//           <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
//             <ResponsiveContainer height={chartHeight} width="100%">
//               <LineChart data={barChartData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
//                 <CartesianGrid strokeDasharray="2 4" vertical={false} />
//                 <XAxis axisLine={false} dataKey="name" interval={4} tickLine={false} type="category" />
//                 <YAxis axisLine={false} domain={[0, 120]} hide type="number" yAxisId={0} />
//                 <YAxis axisLine={false} domain={[2000, 12000]} hide type="number" yAxisId={1} />
//                 {barLines.map(
//                   (line, index): React.JSX.Element => (
//                     <Line
//                       animationDuration={300}
//                       dataKey={line.dataKey}
//                       dot={<Dot />}
//                       key={line.name}
//                       name={line.name}
//                       stroke={line.color}
//                       strokeDasharray={index === 0 ? '0' : '4 4'}
//                       strokeWidth={2}
//                       type="bump"
//                       yAxisId={index}
//                     />
//                   )
//                 )}
//                 <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           </NoSsr>
//           <Legend />
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }

// interface SummaryProps {
//   icon: Icon;
//   title: string;
//   value: number;
// }

// function Summary({ icon: Icon, title, value }: SummaryProps): React.JSX.Element {
//   return (
//     <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
//       <Avatar
//         sx={{
//           '--Avatar-size': '54px',
//           '--Icon-fontSize': 'var(--icon-fontSize-lg)',
//           bgcolor: 'var(--mui-palette-background-paper)',
//           boxShadow: 'var(--mui-shadows-8)',
//           color: 'var(--mui-palette-text-primary)',
//         }}
//       >
//         <Icon fontSize="var(--Icon-fontSize)" />
//       </Avatar>
//       <div>
//         <Typography color="text.secondary" variant="overline">
//           {title}
//         </Typography>
//         <Typography variant="h5">
//           {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
//             value
//           )}
//         </Typography>
//       </div>
//     </Stack>
//   );
// }

// interface DotProps {
//   hover?: boolean;
//   active?: string;
//   cx?: number;
//   cy?: number;
//   payload?: { name: string };
//   stroke?: string;
// }

// function Dot({ active, cx, cy, payload, stroke }: DotProps): React.JSX.Element | null {
//   if (active && payload?.name === active) {
//     return <circle cx={cx} cy={cy} fill={stroke} r={6} />;
//   }

//   return null;
// }

// function Legend(): React.JSX.Element {
//   return (
//     <Stack direction="row" spacing={2}>
//       {barLines.map((line) => (
//         <Stack direction="row" key={line.name} spacing={1} sx={{ alignItems: 'center' }}>
//           <Box sx={{ bgcolor: line.color, borderRadius: '2px', height: '4px', width: '16px' }} />
//           <Typography color="text.secondary" variant="caption">
//             {line.name}
//           </Typography>
//         </Stack>
//       ))}
//     </Stack>
//   );
// }
// interface TooltipContentProps {
//   active?: boolean;
//   payload?: { name: string; dataKey: string; value: number; stroke: string }[];
//   label?: string;
// }

// function TooltipContent({ active, payload }: TooltipContentProps): React.JSX.Element | null {
//   if (!active) {
//     return null;
//   }

//   return (
//     <Paper sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'var(--mui-shadows-16)', p: 1 }}>
//       <Stack spacing={2}>
//         {payload?.map(
//           (entry, index): React.JSX.Element => (
//             <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: 'center' }}>
//               <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
//                 <Box sx={{ bgcolor: entry.stroke, borderRadius: '2px', height: '8px', width: '8px' }} />
//                 <Typography sx={{ whiteSpace: 'nowrap' }}>{entry.name}</Typography>
//               </Stack>
//               <Typography color="text.secondary" variant="body2">
//                 {index === 0
//                   ? entry.value
//                   : new Intl.NumberFormat('en-US', {
//                       style: 'currency',
//                       currency: 'USD',
//                       maximumFractionDigits: 0,
//                     }).format(entry.value)}
//               </Typography>
//             </Stack>
//           )
//         )}
//       </Stack>
//     </Paper>
//   );
// }
