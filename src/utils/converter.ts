export const CURRENCY_SYMBOLE = '$';

export const formatAmount = (amount: number | undefined | null | string) => {
  try {
    if (amount === null || amount === undefined) {
      return `${CURRENCY_SYMBOLE}0.00`; // Fallback in case of error
    }
    return `${CURRENCY_SYMBOLE}${Number(amount).toFixed(2)}`;
  } catch (error) {
    return `${CURRENCY_SYMBOLE}0.00`; // Fallback in case of error
  }
};



export const formatHours = (hours: number | undefined | null) => {
  try {
    if (hours === null || hours === undefined) {
      return '0.0 Hr'; // Fallback in case of error
    }
    return `${hours.toFixed(1)} Hr`;
  } catch (error) {
    return '0.0 Hr'; // Fallback in case of error
  }
};

