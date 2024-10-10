export const CURRENCY_SYMBOLE = '$';

export const formatAmount = (amount: number) => {
  if(!amount){
    amount = 0;
  }
  return `${CURRENCY_SYMBOLE}${amount.toFixed(2)}`;
};


export const formatHours = (hours: number) => {
  if(!hours){
    hours=0;
  }
  return `${hours.toFixed(1)} Hr`;
};
