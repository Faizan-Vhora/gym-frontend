'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MEMBERSHIP_PAYMENT_STATUS_DETAILS,
  MEMBERSHIP_PLAN_STATUS,
  MEMBERSHIP_PLAN_STATUS_DETAILS,
} from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import { Button, Card, CardContent, CardProps, Chip, IconButton, Stack, Typography } from '@mui/material';
import { XCircle } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';

import { MembershipType } from '../subscriptions/subscription-table';
import { ChooseMembershipDialog } from './membership-popover';
import { UpdateMembershipStatusDialog } from './membership-status-popover';

interface MembershipPlanCardProps extends CardProps {
  title: string;
  durationInMonths: number;
  expiryDate?: Date; // Make expiryDate optional
  description: string;
  cost: number;
  paymentStatus?: string | null;
  membershipId?: number | null;
  membershipTypeId?: string | null;
  membershipStatus?: string | null;
  showSelectPlanButton?: boolean;
  showMembershipStatus?: boolean;
  showMembershipPaymentStatus?: boolean;
  showRenewButton?: boolean;
  showCrossButton?: boolean;
  onButtonClick: () => void;
}

interface Membership {
  id: number;
  startDate: string;
  expiryDate: string;
  status: string;
  paymentStatus: string;
  totalPaymentAmount: number;
  createdAt: string;
  updatedAt: string;
  membershipType: number;
  updatedBy: number;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  title,
  durationInMonths,
  expiryDate,
  description,
  cost,
  paymentStatus,
  membershipId,
  membershipTypeId,
  membershipStatus,
  showSelectPlanButton,
  showMembershipStatus,
  showMembershipPaymentStatus,
  showRenewButton,
  showCrossButton,
  onButtonClick,
  ...cardProps
}) => {
  // Check if expiryDate is a valid Date object and format it

  const [openDialog, setOpenDialog] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string | null>(null);
  const [newMembershipStatus, setNewMembershipStatus] = useState<string | null>(null);
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null | undefined>(null);
  const [membershipData, setMembershipData] = useState<Membership | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(membershipStatus === 'expired');

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isExpiryDateValid = expiryDate && !isNaN(new Date(membershipData?.expiryDate || expiryDate).getTime());
  const formattedExpiryDate = isExpiryDateValid
    ? dayjs(membershipData?.expiryDate || expiryDate).format('MMM D, YYYY')
    : '';

  const handleChipClick = () => {
    setOpenDialog(true); // Open dialog on chip click
  };

  const openMembershipDialogHandler = (planId: string | null | undefined) => {
    setSelectedPlanId(planId); // Set the selected plan ID
    setOpenMembershipDialog(true); // Open the dialog
  };

  const closeMembershipDialogHandler = () => {
    setOpenMembershipDialog(false); // Close the dialog
  };

  const handleButtonClick = async (planId: string | null | undefined, membershipStartDate: string | null) => {
    if (!planId) {
      toast.error('Plan ID not found.');
      return;
    }
    try {
      const startDate = membershipStartDate || new Date().toISOString().slice(0, 10);
      // Call the API to update the membership plan
      const response = await axiosInstance.post<{ data: Membership }>(`/users/assign-membership`, {
        user: Number(id),
        membershipType: Number(planId),
        startDate: startDate,
      });
      setMembershipData(response.data.data);
      setIsExpired(response.data.data.status === 'expired');
      toast.success('Plan updated successfully');
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  };

  const handleMembershipDialogSubmit = (data: { startDate: string | null }) => {
    void handleButtonClick(selectedPlanId, data.startDate); // Proceed with the button click using the selected plan
    closeMembershipDialogHandler(); // Close the dialog
  };

  const handleDialogClose = () => {
    setOpenDialog(false); // Close dialog
  };

  const handleStatusSubmit = async (data: { status: string }) => {
    const memberShipId = membershipId; // Replace with the actual membership ID

    try {
      const response = await axiosInstance.patch(`/users/membership/payment-status/${memberShipId}`, {
        paymentStatus: data.status, // Include the new status in the request body
      });

      // Handle successful response
      if (response.status === 200) {
        toast.success('Membership status updated successfully!'); // Show success message
        setNewPaymentStatus(data.status);
      }
    } catch (error) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
    }
  };

  interface UpdateStatusResponse {
    status: string | null; // Or whatever type the `status` is supposed to be
  }

  React.useEffect(() => {
    if (!newMembershipStatus) return;

    const updateStatus = async () => {
      let swalText = `Do you want to change the status?`;
      let swalConfirmButtonText = `Yes, `;
      let swalSuccessMessage = `The status has been updated`;

      if (newMembershipStatus === MEMBERSHIP_PLAN_STATUS.CANCEL) {
        swalText = `Do you want to cancel the subscription?`;
        swalConfirmButtonText = `Yes`;
        swalSuccessMessage = `The subscription has been cancelled`;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: swalText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: swalConfirmButtonText,
        cancelButtonText: 'No',
      });

      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.patch<UpdateStatusResponse>(
            `/users/membership/update-status/${membershipId}`,
            {
              status: newMembershipStatus,
            }
          );
          toast.success(swalSuccessMessage);
        } catch (error) {
          await Swal.fire('Error!', 'Failed to update.', 'error');
        }
      }
    };

    void updateStatus();
  }, [newMembershipStatus, membershipId]);

  // Function to set new status
  const handleStatusChange = (status: MembershipType['status']) => {
    setNewMembershipStatus(status);
  };

  // const handleStatusChange = async (newStatus: MembershipType['status']): Promise<void> => {
  //   let swalText = `Do you want to change the status?`;
  //   let swalConfirmButtonText = `Yes, `;
  //   let swalSuccessMessage = `The status has been updated`;

  //   if (newStatus === MEMBERSHIP_PLAN_STATUS.CANCEL) {
  //     swalText = `Do you want to cancel the subscription?`;
  //     swalConfirmButtonText = `Yes`;
  //     swalSuccessMessage = `The subscription has been cancelled`;
  //   }

  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: swalText,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: swalConfirmButtonText,
  //     cancelButtonText: 'No',
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       const response = await axiosInstance.patch<UpdateStatusResponse>(
  //         `/users/membership/update-status/${membershipId}`,
  //         {
  //           status: newStatus,
  //         }
  //       );
  //       toast.success(swalSuccessMessage);
  //       setNewMembershipStatus(response.data.status);
  //     } catch (error) {
  //       await Swal.fire('Error!', 'Failed to update.', 'error');
  //     }
  //   }
  // };

  return (
    <Card className="memberCard" {...cardProps}>
      <Stack flexDirection="row" justifyContent={'right'}>
        {showCrossButton && (
          <IconButton
            disabled={
              !membershipStatus ||
              [MEMBERSHIP_PLAN_STATUS.CANCEL, MEMBERSHIP_PLAN_STATUS.EXPIRED].includes(
                newMembershipStatus || membershipStatus
              )
            }
            onClick={() => {
              void handleStatusChange(MEMBERSHIP_PLAN_STATUS.CANCEL);
            }}
          >
            <XCircle />
          </IconButton>
        )}
      </Stack>
      <CardContent style={{ flexGrow: 1 }}>
        <Stack flexDirection={'row'} alignItems={'center'}>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
          {showMembershipStatus && (
            <Typography variant="h6" component="div" color="black">
              {membershipStatus && (
                <Chip
                  label={
                    MEMBERSHIP_PLAN_STATUS_DETAILS[newMembershipStatus || membershipData?.status || membershipStatus]
                      ?.label
                  }
                  color={
                    MEMBERSHIP_PLAN_STATUS_DETAILS[newMembershipStatus || membershipData?.status || membershipStatus]
                      ?.color
                  }
                  sx={{ ml: 2 }}
                  // onClick={handleChipClick}
                />
              )}
            </Typography>
          )}
        </Stack>
        <Typography color="text.secondary" gutterBottom>
          Duration: {durationInMonths} months
        </Typography>
        {isExpiryDateValid && (
          <Typography color="text.secondary" gutterBottom>
            Expiry Date: {formattedExpiryDate}
          </Typography>
        )}
        <Typography variant="body2" paragraph>
          {description}
        </Typography>
        <Stack flexDirection={'row'} alignItems={'center'}>
          <Typography variant="h6" component="div" color="black">
            {formatAmount(cost)}
          </Typography>
          {showMembershipPaymentStatus && (
            <Typography variant="h6" component="div" color="black">
              {paymentStatus && (
                <Chip
                  label={
                    MEMBERSHIP_PAYMENT_STATUS_DETAILS[
                      membershipData?.paymentStatus || newPaymentStatus || paymentStatus
                    ]?.label
                  }
                  color={
                    MEMBERSHIP_PAYMENT_STATUS_DETAILS[
                      membershipData?.paymentStatus || newPaymentStatus || paymentStatus
                    ]?.color
                  }
                  sx={{ ml: 2 }}
                  onClick={handleChipClick}
                />
              )}
            </Typography>
          )}
        </Stack>
        <UpdateMembershipStatusDialog
          currentStatus={newPaymentStatus || paymentStatus}
          open={openDialog}
          onClose={handleDialogClose}
          onSubmit={handleStatusSubmit}
        />
      </CardContent>

      {showRenewButton && isExpired && (
        <Button
          className="common-button"
          variant="contained"
          style={{ margin: '10px', alignSelf: 'center' }}
          onClick={() => {
            openMembershipDialogHandler(membershipTypeId);
          }}
        >
          Renew Plan
        </Button>
      )}

      <ChooseMembershipDialog
        open={openMembershipDialog}
        onClose={closeMembershipDialogHandler}
        onSubmit={handleMembershipDialogSubmit}
      />
      {showSelectPlanButton && (
        <Button
          className="common-button"
          variant="contained"
          style={{ margin: '10px', alignSelf: 'center' }}
          onClick={onButtonClick}
        >
          Choose Plan
        </Button>
      )}
    </Card>
  );
};

export default MembershipPlanCard;
