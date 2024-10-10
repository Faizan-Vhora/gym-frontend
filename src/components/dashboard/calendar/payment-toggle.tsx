import React, { useState } from 'react';
import { BOOKING_PAYMENT_TYPE } from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface PaymentToggleProps {
  bookingAmount: number;
  setPaymentType: (type: string) => void;
}

const PaymentToggle: React.FC<PaymentToggleProps> = ({ bookingAmount, setPaymentType }) => {
  const [paymentType, setLocalPaymentType] = useState<string>(BOOKING_PAYMENT_TYPE.PER_SESSION);

  const handlePaymentChange = (event: React.MouseEvent<HTMLElement>, newPaymentType: string | null): void => {
    if (newPaymentType) {
      setLocalPaymentType(newPaymentType);
      setPaymentType(newPaymentType);
    }
  };

  return (
    <ToggleButtonGroup value={paymentType} exclusive onChange={handlePaymentChange} aria-label="payment type">
      <ToggleButton value={BOOKING_PAYMENT_TYPE.PER_SESSION} aria-label="pay per session">
        Pay per session
      </ToggleButton>
      <ToggleButton value={BOOKING_PAYMENT_TYPE.FULL} aria-label="pay in full">
        Pay in Full {formatAmount(bookingAmount)}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default PaymentToggle;
