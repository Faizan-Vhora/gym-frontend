export const CURRENCY_SYMBOLE = '$';

export const formatAmount = (inputAmount: number) => {
  const amount = inputAmount || 0; // Use a new variable instead of modifying the parameter
  return `${CURRENCY_SYMBOLE}${amount.toFixed(2)}`;
};


export const formatHours = (inputHours: number) => {
  const hours = inputHours || 0; // Use a new variable instead of modifying the parameter
  return `${hours.toFixed(1)} Hr`;
};
