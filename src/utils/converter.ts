export const CURRENCY_SYMBOLE = '$';

export const formatAmount = (amount: number | undefined | null) => {
  try {
    if (amount == null) {
      amount = 0; // Handle null or undefined
    }
    return `${CURRENCY_SYMBOLE}${amount.toFixed(2)}`;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return `${CURRENCY_SYMBOLE}0.00`; // Fallback in case of error
  }
};



export const formatHours = (hours: number | undefined | null) => {
  try {
    if (hours == null) {
      hours = 0; // Handle null or undefined
    }
    return `${hours.toFixed(1)} Hr`;
  } catch (error) {
    console.error('Error formatting hours:', error);
    return '0.0 Hr'; // Fallback in case of error
  }
};

