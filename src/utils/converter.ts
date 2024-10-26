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

export const formatDashboardAmount = (amount: number | undefined | null | string) => {
  const CURRENCY_SYMBOL = "$"; // Replace with your actual currency symbol

  try {
    if (amount === null || amount === undefined) {
      return `${CURRENCY_SYMBOL}0.00`;
    }

    const numericAmount = Number(amount);

    if (numericAmount >= 1000) {
      return `${CURRENCY_SYMBOL}${(numericAmount / 1000).toFixed(2)}K`;
    }

    return `${CURRENCY_SYMBOL}${numericAmount.toFixed(2)}`;
  } catch (error) {
    return `${CURRENCY_SYMBOL}0.00`;
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

