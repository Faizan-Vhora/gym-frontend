import React from 'react';
import { Button, Card, CardContent, CardProps, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface MembershipPlanCardProps extends CardProps {
  title: string;
  durationInMonths: number;
  expiryDate?: Date; // Make expiryDate optional
  description: string;
  cost: number;
  onlyShow: boolean;
  onButtonClick: () => void;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  title,
  durationInMonths,
  expiryDate,
  description,
  cost,
  onlyShow,
  onButtonClick,
  ...cardProps
}) => {
  // Check if expiryDate is a valid Date object and format it
  const isExpiryDateValid = expiryDate && !isNaN(new Date(expiryDate).getTime());
  const formattedExpiryDate = isExpiryDateValid ? dayjs(expiryDate).format('MMM D, YYYY') : '';

  return (
    <Card className='memberCard' {...cardProps}>
      <CardContent style={{ flexGrow: 1 }}>

        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
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
        <Typography variant="h6" component="div" color="black">
          ${cost}
        </Typography>
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
