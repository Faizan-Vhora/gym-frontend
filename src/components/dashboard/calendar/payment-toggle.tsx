import { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const SESSION_PAYMENT_TYPES = {
  PER_SESSION: 'per_session',
  FULL: 'full',
};

interface PaymentToggleProps {
  bookingAmount: number;
  setPaymentType: (type: string) => void;
}

function PaymentToggle({ bookingAmount, setPaymentType }: PaymentToggleProps) {
  const [paymentType, setLocalPaymentType] = useState(SESSION_PAYMENT_TYPES.PER_SESSION);

  const handlePaymentChange = (event: React.MouseEvent<HTMLElement>, newPaymentType: string | null) => {
    if (newPaymentType) {
      setLocalPaymentType(newPaymentType);
      setPaymentType(newPaymentType); // Notify parent component about the change
    }
  };

  return (
    <ToggleButtonGroup value={paymentType} exclusive onChange={handlePaymentChange} aria-label="payment type">
      <ToggleButton value={SESSION_PAYMENT_TYPES.PER_SESSION} aria-label="pay per session">
        Pay per session
      </ToggleButton>
      <ToggleButton value={SESSION_PAYMENT_TYPES.FULL} aria-label="pay in full">
        Pay in Full ${bookingAmount}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default PaymentToggle;
