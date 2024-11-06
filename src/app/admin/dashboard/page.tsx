'use client';

import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
// import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';

// import { config } from '@/config';
import axiosInstance from '@/lib/axios';
import { Budget } from '@/components/admin/overview/budget';
import { CheckInBarChart } from '@/components/admin/overview/check-in-frequency';
import { CheckInUsers } from '@/components/admin/overview/check-in-users';
import { LatestOrders } from '@/components/admin/overview/latest-orders';
import { IncompleteProfiles } from '@/components/admin/overview/latest-products';
import { ActivevsExpiredMemberships } from '@/components/admin/overview/membership-bar-chart';
import { MembershipGrowth } from '@/components/admin/overview/membership-growth';
import { Memberships } from '@/components/admin/overview/memberships';
import { MembershipExpiring } from '@/components/admin/overview/memberships-expiring';
import { MonthlyRevenueTrends } from '@/components/admin/overview/revenue-line-graph';
import { Sales } from '@/components/admin/overview/sales';
import { TasksProgress } from '@/components/admin/overview/tasks-progress';
import { TotalCustomers } from '@/components/admin/overview/total-customers';
import { Traffic } from '@/components/admin/overview/traffic';
import { TrainerSessionsConducted } from '@/components/admin/overview/trainer-sessions-conducted';
import { TrainerUtitlization } from '@/components/admin/overview/trainer-utitlization';
import { UserEngagement } from '@/components/admin/overview/user-engagement';

// export const metadata = { title: `Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<ChartSeries[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [mebershipPlanChartSeries, setMebershipPlanChartSeries] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [latestBookings, setLatestBookings] = React.useState<
    {
      id: number;
      customerEmail: string;
      customerPhoneNumber: string;
      name: string;
      trainerName: string;
      trainerEmail: string;
      trainerPhoneNumber: string;
      createdAt: string;
      status: string;
    }[]
  >([]);
  const [sessionAttendedPercentage, setSessionAttendedPercentage] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

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

  interface Customer {
    fullName: string;
    email: string;
    phoneNumber: string;
  }

  interface Trainer {
    fullName: string;
    email: string;
    phoneNumber: string;
  }

  interface Booking {
    id: number;
    customer: Customer;
    trainer: Trainer;
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
          name: booking.customer?.fullName, // Safe access to the customer name
          customerEmail: booking.customer?.email,
          customerPhoneNumber: booking.customer?.phoneNumber,
          trainerName: booking.trainer?.fullName,
          trainerEmail: booking.trainer?.email,
          trainerPhoneNumber: booking.trainer?.phoneNumber,
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
      <Grid lg={4} sm={6} xs={12}>
        <TotalCustomers sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <Budget sx={{ height: '100%' }} />
      </Grid>
      {/* <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value="$15k" />
      </Grid> */}

      <Grid lg={4} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={Number(sessionAttendedPercentage)} />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales categories={categories} chartSeries={chartSeries} sx={{ height: '100%' }} />
      </Grid>

      <Grid lg={4} md={6} xs={12}>
        <IncompleteProfiles />
      </Grid>

      {/* <Grid lg={4} xs={12}>
        <CostBreakdown />
      </Grid> */}

      <Grid lg={12} md={12} xs={12}>
        <LatestOrders orders={latestBookings} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <Memberships sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <UserEngagement sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TrainerUtitlization sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={mebershipPlanChartSeries} labels={labels} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <CheckInUsers />
      </Grid>

      <Grid lg={4} md={4} xs={12}>
        <MembershipExpiring />
      </Grid>

      <Grid md={8} xs={12}>
        <ActivevsExpiredMemberships />
      </Grid>
      <Grid md={12} xs={12}>
        <TrainerSessionsConducted />
      </Grid>
      <Grid md={12} xs={12}>
        <CheckInBarChart />
      </Grid>
      <Grid md={6} xs={12}>
        <MembershipGrowth />
      </Grid>
      <Grid md={6} xs={12}>
        <MonthlyRevenueTrends />
      </Grid>

      {loading && <CustomLoader />}
    </Grid>
  );
}
