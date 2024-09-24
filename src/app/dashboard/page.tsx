'use client';

import * as React from 'react';
import { CustomLoader } from '@/utils/loader';
// import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

// import { config } from '@/config';
import axiosInstance from '@/lib/axios';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

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
        toast.error('Failed to load total members count');
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
        toast.error('Failed to load total members count');
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
        toast.error('Failed to load total members count');
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
        toast.error('Failed to load incomplete profiles');
      } finally {
        setLoading(false);
      }
    };

    void fetchIncompleteProfiles();
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
        <TasksProgress sx={{ height: '100%' }} value={75.5} />
      </Grid>

      <Grid lg={8} xs={12}>
        <Sales categories={categories} chartSeries={chartSeries} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={mebershipPlanChartSeries} labels={labels} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={members}
          // products={[
          //   {
          //     id: 'PRD-005',
          //     name: 'Soja & Co. Eucalyptus',
          //     image: '/assets/product-5.png',
          //     updatedAt: dayjs().subtract(18, 'minutes').subtract(5, 'hour').toDate(),
          //   },
          //   {
          //     id: 'PRD-004',
          //     name: 'Necessaire Body Lotion',
          //     image: '/assets/product-4.png',
          //     updatedAt: dayjs().subtract(41, 'minutes').subtract(3, 'hour').toDate(),
          //   },
          //   {
          //     id: 'PRD-003',
          //     name: 'Ritual of Sakura',
          //     image: '/assets/product-3.png',
          //     updatedAt: dayjs().subtract(5, 'minutes').subtract(3, 'hour').toDate(),
          //   },
          //   {
          //     id: 'PRD-002',
          //     name: 'Lancome Rouge',
          //     image: '/assets/product-2.png',
          //     updatedAt: dayjs().subtract(23, 'minutes').subtract(2, 'hour').toDate(),
          //   },
          //   {
          //     id: 'PRD-001',
          //     name: 'Erbology Aloe Vera',
          //     image: '/assets/product-1.png',
          //     updatedAt: dayjs().subtract(10, 'minutes').toDate(),
          //   },
          // ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestOrders
          orders={[
            {
              id: 'ORD-007',
              customer: { name: 'Ekaterina Tankova' },
              amount: 30.5,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-006',
              customer: { name: 'Cao Yu' },
              amount: 25.1,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-004',
              customer: { name: 'Alexa Richardson' },
              amount: 10.99,
              status: 'refunded',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-003',
              customer: { name: 'Anje Keizer' },
              amount: 96.43,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-002',
              customer: { name: 'Clarke Gillebert' },
              amount: 32.54,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-001',
              customer: { name: 'Adam Denisov' },
              amount: 16.76,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>

      {loading && <CustomLoader />}
    </Grid>
  );
}
