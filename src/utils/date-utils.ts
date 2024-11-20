
export const DATE_FORMAT = 'MM/DD/YYYY'



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

export const formatDate = (dateString: string ) => {
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if it's not a valid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}-${day}-${year}`;
};


export const formatTime = (inputDate: Date | string | null) => {
  if (!inputDate) return null; // Handle null case

  // Create a new date object if the input is a string
  const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate;

  const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad with zeros
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds

  return `${hours}:${minutes}:${seconds}`; // Return formatted time
};


export function formatTo12HourFormat(time: string, timezone: string | null = null) {
  if (!time) {
    return "-";
  }

  // If timezone is 'UTC', convert the time to local timezone
  if (timezone === "UTC") {
    // Assuming the time is in HH:mm format
    const [hours, minutes] = time.split(":").map(Number);

    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes)) {
      return "Invalid Time";
    }

    // Create a UTC Date object from the input time (ignoring the date part)
    const dateUtc = new Date(Date.UTC(1970, 0, 1, hours, minutes));

    // Use Intl.DateTimeFormat to convert the time into the local timezone
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the system's local timezone
    }).format(dateUtc);
  }

  // If timezone is not 'UTC', process the time as is (in HH:mm format)
  const [hours, minutes] = time.split(":").map(Number);
  
  // Validate hours and minutes
  if (isNaN(hours) || isNaN(minutes)) {
    return "Invalid Time";
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert hour 0 to 12

  return `${hours12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

// export function formatTo12HourFormat(time: string, timezone: string | null = null) {
//   if (!time) {
//     return "-";
//   }

//   // Create a new variable instead of modifying the time parameter
//   let formattedTime = time;

//   // If timezone is 'UTC', convert the time to local timezone
//   if (timezone === 'UTC') {
//     const dateUtc = new Date(`1970-01-01T${time}Z`); // UTC time
//     formattedTime = dateUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   }

//   const [hours, minutes] = formattedTime.split(':').map(Number);
//   const ampm = hours >= 12 ? 'PM' : 'AM';
//   const hours12 = hours % 12 || 12; // Convert hour 0 to 12

//   return `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
// }



export  function calculateWeeksBetweenDates(startDateStr: string, endDateStr: string): number {
  // Convert the input strings to Date objects
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Calculate the difference in milliseconds
  const diffInMs = endDate.getTime() - startDate.getTime();

  // Convert the difference from milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Convert days to weeks and return the integer value
  const weeksBetween = Math.floor(diffInDays / 7);

  return weeksBetween;
}

