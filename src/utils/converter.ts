export const CURRENCY_SYMBOLE = '$';

export const formatAmount = (amount: number) => {
  return `${CURRENCY_SYMBOLE}${amount.toFixed(2)}`;
};


export const formatHours = (hours: number) => {
  return `${hours.toFixed(1)} Hr`;
};
