// pages/membership-plans.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Alert, Button, Card, CardHeader, Divider, Grid, Stack, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';

import axiosInstance from '@/lib/axios';
import MembershipPlanCard from '@/components/admin/membership-plan/membership-card'; // Import the new component
import type { MembershipPlans } from '@/components/admin/membership-plan/membership-plan-table';
import { ChooseMembershipDialog } from '@/components/admin/membership-plan/membership-popover';

interface PlanI {
  id: string;
  title: string;
  durationInMonths: number;
  expiryDate: Date;
  description: string;
  cost: number;
  paymentFrequency: string;
}

interface CustomerS {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  status: number; // Ensure this is part of the interface
  qrCodeImageUrl: string;
  membership: {
    startDate: Date;
    expiryDate: Date;
    status: string;
    paymentStatus: string;
    membershipType: {
      id: string;
      title: string;
      durationInMonths: number;
      description: string;
      cost: number;
      paymentFrequency: string;
    };
  };
}

const MembershipPlansForm: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [plans, setPlans] = useState<PlanI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerS | null>(null);
  const router = useRouter();
  interface MembershipPlanResponse {
    data: MembershipPlans[];
  }

  // Fetching membership plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get<MembershipPlanResponse>('/membership-types/dropdown');
        setPlans(response.data.data);
        setLoading(true);
      } catch (err: unknown) {
        let errorMessage: string;
        if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    void fetchPlans();
  }, []);

  const handleButtonClick = async (planId: string | null, membershipStartDate: string | null) => {
    if (!planId) return;
    try {
      const startDate = membershipStartDate || new Date().toISOString().slice(0, 10);
      // Call the API to update the membership plan
      await axiosInstance.post(`/users/assign-membership`, {
        user: Number(id),
        membershipType: Number(planId),
        startDate: startDate,
      });
      toast.success('Plan updated successfully');

      // Fetch the updated user data after the plan update
      const response = await axiosInstance.get<{ data: CustomerS }>(`/users/${id}`, {
        params: { userType: 3 },
      });
      setCustomer(response.data.data);
      router.push('/admin/customers');
      // Update the customerS state with the new data
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  };

  const openMembershipDialogHandler = (planId: string) => {
    setSelectedPlanId(planId); // Set the selected plan ID
    setOpenMembershipDialog(true); // Open the dialog
  };

  const closeMembershipDialogHandler = () => {
    setOpenMembershipDialog(false); // Close the dialog
  };

  const handleMembershipDialogSubmit = (data: { startDate: string | null }) => {
    void handleButtonClick(selectedPlanId, data.startDate); // Proceed with the button click using the selected plan
    closeMembershipDialogHandler(); // Close the dialog
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" style={{ marginTop: '50px' }}>
        <CustomLoader />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" style={{ marginTop: '50px' }}>
        <Alert severity="error">{error}</Alert>
      </Grid>
    );
  }

  return (
    <Grid>
      <Card>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Membership Plans" />
        <Divider />
        <Stack spacing={5}>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/admin/customers');
            }}
            sx={{
              width: '10%',
              marginLeft: 'auto',
              borderColor: '#d0021b',
              fontFamily: 'Audiowide, sans-serif !important',
              color: '#d0021b',
              transform: 'skewX(-20deg)',
              '&:hover': {
                borderColor: 'darkred',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
          >
            Skip
          </Button>
        </Stack>
        <Grid container spacing={3} justifyContent="center" style={{ marginTop: '20px' }}>
          {plans.length > 0 ? (
            plans.map((plan: PlanI) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <MembershipPlanCard
                  title={plan.title}
                  durationInMonths={plan.durationInMonths}
                  expiryDate={plan.expiryDate}
                  description={plan.description}
                  cost={plan.cost}
                  paymentStatus={customer?.membership?.paymentStatus}
                  onlyShow={true}
                  onButtonClick={() => {
                    openMembershipDialogHandler(plan.id);
                  }}
                />
              </Grid>
            ))
          ) : (
            <Typography variant="h6" color="text.secondary" align="center">
              No membership plans available.
            </Typography>
          )}

          <ToastContainer />
          <ChooseMembershipDialog
            open={openMembershipDialog}
            onClose={closeMembershipDialogHandler}
            onSubmit={handleMembershipDialogSubmit}
          />
        </Grid>
      </Card>
    </Grid>
  );
};

export default MembershipPlansForm;
