'use client';

import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
// import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

// import { config } from '@/config';
import axiosInstance from '@/lib/axios';
import { Budget } from '@/components/admin/overview/budget';
import { LatestOrders } from '@/components/admin/overview/latest-orders';
import { LatestProducts } from '@/components/admin/overview/latest-products';
import { Sales } from '@/components/admin/overview/sales';
import { TasksProgress } from '@/components/admin/overview/tasks-progress';
import { TotalCustomers } from '@/components/admin/overview/total-customers';
import { TotalProfit } from '@/components/admin/overview/total-profit';
import { Traffic } from '@/components/admin/overview/traffic';

// export const metadata = { title: `Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [totalCustomers, setTotalCustomers] = React.useState<number | null>(null);
  const [diff, setDiff] = React.useState<number>(0);
  const [trend, setTrend] = React.useState<'up' | 'down'>('up');
  const [chartSeries, setChartSeries] = React.useState<ChartSeries[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [mebershipPlanChartSeries, setMebershipPlanChartSeries] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [members, setMembers] = React.useState<
    { id: number; name: string; image: string; createdAt: string; userType: number }[]
  >([]);
  const [latestBookings, setLatestBookings] = React.useState<
    { id: number; name: string; createdAt: string; status: string }[]
  >([]);
  const [sessionAttendedPercentage, setSessionAttendedPercentage] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface Progress {
    trendType: 'up' | 'down';
    diffValue: number;
  }

  interface TotalCustomerResponse {
    totalMembers: number;
    progress: Progress;
  }

  interface ChartSeries {
    name: string;
    data: [number];
  }

  interface MemberRegisteredResponse {
    chartSeries: [ChartSeries];
    categories: [string];
  }

  interface MembershipPlanResponse {
    chartSeries: [number];
    labels: [string];
  }

  React.useEffect(() => {
    const fetchTotalMembers = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: TotalCustomerResponse }>('/deshboard/total-members-count');

        const totalCustomerData = response.data.data;

        const { totalMembers, progress } = totalCustomerData;

        setTotalCustomers(totalMembers);
        setDiff(progress.diffValue);
        setTrend(progress.trendType);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchTotalMembers();
  }, []);

  React.useEffect(() => {
    const fetchMemberRegistered = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: MemberRegisteredResponse }>('/deshboard/member-registered');

        const totalMemberRegisteredData = response.data.data;

        setChartSeries(totalMemberRegisteredData.chartSeries);
        setCategories(totalMemberRegisteredData.categories);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMemberRegistered();
  }, []);

  React.useEffect(() => {
    const fetchMembershipPlans = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: MembershipPlanResponse }>('/deshboard/monthly-subscriptions');

        const totalMembershipPlansData = response.data.data;

        setMebershipPlanChartSeries(totalMembershipPlansData.chartSeries);
        setLabels(totalMembershipPlansData.labels);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchMembershipPlans();
  }, []);

  interface IncompleteMemberResponse {
    id: number;
    fullName: string;
    email: string;
    profileImageUrl: string | '';
    createdAt: string;
    userType: number;
  }

  React.useEffect(() => {
    const fetchIncompleteProfiles = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: IncompleteMemberResponse[] }>(
          '/deshboard/incomplete-profiles'
        );

        const totalIncompleteMembersData = response.data.data;

        // Map the response to match the structure required by LatestProducts
        const mappedMembers = totalIncompleteMembersData.map((member) => ({
          id: member.id,
          name: member.fullName,
          image: member.profileImageUrl || '/assets/User@3x-1.png', // Provide default image if none exists
          createdAt: dayjs(member.createdAt).format('MMM D, YYYY'), // Convert string to Date object
          userType: member.userType,
        }));

        // Set the mapped data into products state
        setMembers(mappedMembers);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchIncompleteProfiles();
  }, []);

  interface Customer {
    fullName: string;
  }

  interface Booking {
    id: number;
    customer: Customer;
    createdAt: string;
    status: string;
  }

  interface ApiResponse<T> {
    data: {
      items: T[];
    };
  }
  React.useEffect(() => {
    const fetchLatestBooking = async (): Promise<void> => {
      setLoading(true);
      try {
        // Type the API response to ensure we know what is being returned
        const response = await axiosInstance.get<ApiResponse<Booking>>('/deshboard/latest-booking');

        const latestBooking = response.data.data;

        // Safely map the response to match the structure required by LatestProducts
        const mappedBookings = latestBooking.items.map((booking: Booking) => ({
          id: booking.id,
          name: booking.customer.fullName, // Safe access to the customer name
          createdAt: booking.createdAt,
          status: booking.status,
        }));

        // Set the mapped data into the latestBookings state
        setLatestBookings(mappedBookings);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };
    void fetchLatestBooking();
  }, []);

  interface SessionAttendanceResponse {
    month: string;
    totalSessions: number;
    attendedSessions: number;
    attendancePercentage: string;
  }

  React.useEffect(() => {
    const fetchSessionAttended = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: SessionAttendanceResponse }>(
          '/deshboard/current-month-session-attendance'
        );

        const sessionAttendanceData = response.data.data;

        // Update state with the mapped data
        setSessionAttendedPercentage(parseFloat(sessionAttendanceData.attendancePercentage));
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchSessionAttended();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget diff={12} trend="up" sx={{ height: '100%' }} value="$24k" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value="$15k" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers diff={diff} trend={trend} sx={{ height: '100%' }} value={totalCustomers} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={Number(sessionAttendedPercentage)} />
      </Grid>

      <Grid lg={8} xs={12}>
        <Sales categories={categories} chartSeries={chartSeries} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={mebershipPlanChartSeries} labels={labels} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts products={members} />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestOrders
          orders={latestBookings}
          // orders={[
          //   {
          //     id: 'ORD-007',
          //     customer: { name: 'Ekaterina Tankova' },
          //     amount: 30.5,
          //     status: 'pending',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          //   {
          //     id: 'ORD-006',
          //     customer: { name: 'Cao Yu' },
          //     amount: 25.1,
          //     status: 'delivered',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          //   {
          //     id: 'ORD-004',
          //     customer: { name: 'Alexa Richardson' },
          //     amount: 10.99,
          //     status: 'refunded',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          //   {
          //     id: 'ORD-003',
          //     customer: { name: 'Anje Keizer' },
          //     amount: 96.43,
          //     status: 'pending',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          //   {
          //     id: 'ORD-002',
          //     customer: { name: 'Clarke Gillebert' },
          //     amount: 32.54,
          //     status: 'delivered',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          //   {
          //     id: 'ORD-001',
          //     customer: { name: 'Adam Denisov' },
          //     amount: 16.76,
          //     status: 'delivered',
          //     createdAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          // ]}
        />
      </Grid>

      {loading && <CustomLoader />}
    </Grid>
  );
}
