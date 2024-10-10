
export const DATE_FORMAT = 'DD/MM/YYYY'



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

export const formatDate = (dateString: string)=>{
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}


export const formatTime = (inputDate: Date | string | null) => {
  if (!inputDate) return null; // Handle null case

  // Create a new date object if the input is a string
  const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate;

  const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad with zeros
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds

  return `${hours}:${minutes}:${seconds}`; // Return formatted time
};

export function convertTo12HourFormat(time:string) {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert hour 0 to 12
  return `${hours12}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
}
