// components/MembershipPlanCard.tsx
import React from 'react';
import { Button, Card, CardContent, CardProps, Typography } from '@mui/material';

interface MembershipPlanCardProps extends CardProps {
  title: string;
  durationInMonths: number;
  description: string;
  cost: number;
  onlyShow: boolean;
  onButtonClick: () => void;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  title,
  durationInMonths,
  description,
  cost,
  onlyShow,
  onButtonClick,
  ...cardProps
}) => {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }} {...cardProps}>
      <CardContent style={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Duration: {durationInMonths} months
        </Typography>
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
