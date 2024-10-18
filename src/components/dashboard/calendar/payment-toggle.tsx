import React, { useState } from 'react';
import { BOOKING_PAYMENT_TYPE } from '@/utils/constant';
import { formatAmount } from '@/utils/converter';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface PaymentToggleProps {
  netTotalAmount: number;
  setPaymentType: (type: string) => void;
}

const PaymentToggle: React.FC<PaymentToggleProps> = ({ netTotalAmount, setPaymentType }) => {
  const [paymentType, setLocalPaymentType] = useState<string>(BOOKING_PAYMENT_TYPE.PER_SESSION);

  const handlePaymentChange = (event: React.MouseEvent<HTMLElement>, newPaymentType: string | null): void => {
    if (newPaymentType) {
      setLocalPaymentType(newPaymentType);
      setPaymentType(newPaymentType);
    }
  };

  return (
    <ToggleButtonGroup sx={{columnGap:'20px'}} value={paymentType} exclusive onChange={handlePaymentChange} aria-label="payment type">
      <ToggleButton
          sx={
            paymentType == BOOKING_PAYMENT_TYPE.PER_SESSION ?
            {background:'#D60227 !important', borderRadius:'0px',fontSize:'18px ',fontWeight:'400',  transform: 'skewX(-10deg)', color:'#fff !important', fontFamily: 'Audiowide, sans-serif !important'}
            :
            {border:'1px solid #D60227 !important',borderRadius:'0px',fontSize:'18px ',fontWeight:'400', transform: 'skewX(-10deg)', color:'#D60227 !important', background:"#fff !important",fontFamily: 'Audiowide, sans-serif !important'}
          }
          value={BOOKING_PAYMENT_TYPE.PER_SESSION}
          aria-label="pay per session">
        Pay per session
      </ToggleButton>
      <ToggleButton
          sx={
            paymentType == BOOKING_PAYMENT_TYPE.FULL ?
            {background:'#D60227 !important', borderRadius:'0px',fontSize:'18px ',fontWeight:'400',  transform: 'skewX(-10deg)', color:'#fff !important', fontFamily: 'Audiowide, sans-serif !important'}
            :
            {border:'1px solid #D60227 !important',borderRadius:'0px',fontSize:'18px ',fontWeight:'400', transform: 'skewX(-10deg)', color:'#D60227 !important', background:"#fff !important",fontFamily: 'Audiowide, sans-serif !important'}
          }
        value={BOOKING_PAYMENT_TYPE.FULL}
        aria-label="pay in full">
        Pay in Full {formatAmount(netTotalAmount)}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default PaymentToggle;
