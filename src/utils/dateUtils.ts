export const formatUtcToLocalDatetime = (utcDatetimeString:Date | string|null|undefined)=>{

  if(utcDatetimeString){
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // false for 24-hour format
    };

    const utcDate = new Date(utcDatetimeString);
    const formattedDate = utcDate.toLocaleString('en-US', options);
    return formattedDate;
  }
  return null;

}
