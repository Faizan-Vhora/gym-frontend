'use client';

import React, { useState } from 'react';
import { MEMBERSHIP_PAYMENT_STATUS_DETAILS, MEMBERSHIP_PLAN_STATUS_DETAILS } from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import { Button, Card, CardContent, CardProps, Chip, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axios';

import { UpdateMembershipStatusDialog } from './membership-status-popover';

interface MembershipPlanCardProps extends CardProps {
  title: string;
  durationInMonths: number;
  expiryDate?: Date; // Make expiryDate optional
  description: string;
  cost: number;
  paymentStatus?: string | null;
  membershipId?: number | null;
  membershipStatus?: string | null;
  onlyShow: boolean;
  onButtonClick: () => void;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  title,
  durationInMonths,
  expiryDate,
  description,
  cost,
  paymentStatus,
  membershipId,
  membershipStatus,
  onlyShow,
  onButtonClick,
  ...cardProps
}) => {
  // Check if expiryDate is a valid Date object and format it
  const isExpiryDateValid = expiryDate && !isNaN(new Date(expiryDate).getTime());
  const formattedExpiryDate = isExpiryDateValid ? dayjs(expiryDate).format('MMM D, YYYY') : '';
  const [openDialog, setOpenDialog] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string | null>(null);

  const handleChipClick = () => {
    setOpenDialog(true); // Open dialog on chip click
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

  return (
    <Card className="memberCard" {...cardProps}>
      <CardContent style={{ flexGrow: 1 }}>
        <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
          {!onlyShow && (
            <Typography variant="h6" component="div" color="black">
              {membershipStatus && (
                <Chip
                  label={MEMBERSHIP_PLAN_STATUS_DETAILS[membershipStatus]?.label}
                  color={MEMBERSHIP_PLAN_STATUS_DETAILS[membershipStatus]?.color}
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
        <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant="h6" component="div" color="black">
            {formatAmount(cost)}
          </Typography>
          {!onlyShow && (
            <Typography variant="h6" component="div" color="black">
              {paymentStatus && (
                <Chip
                  label={MEMBERSHIP_PAYMENT_STATUS_DETAILS[newPaymentStatus || paymentStatus]?.label}
                  color={MEMBERSHIP_PAYMENT_STATUS_DETAILS[newPaymentStatus || paymentStatus]?.color}
                  sx={{ ml: 2 }}
                  onClick={handleChipClick}
                />
              )}
            </Typography>
          )}
        </Stack>
        <UpdateMembershipStatusDialog open={openDialog} onClose={handleDialogClose} onSubmit={handleStatusSubmit} />
      </CardContent>
      {onlyShow && (
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
