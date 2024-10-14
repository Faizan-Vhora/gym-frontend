export const REGEX_VALIDATION = {
    FULL_NAME : /^[A-Za-z\s]+$/, //Full name can only contain letters and spaces!
    ZIP_CODE  : /^[0-9]+$/, // Zip code must contain only numeric digits without any letters or special characters,
    PHONE_NUMBER : /^\(?\+?1?\)?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/, // Phone number must be a valid US number
    LETTERS_AND_NUMBERS: /^(?![\d\s\W]+$).+/
  }

// USER
export const USER_TYPE = {
  ADMIN : 1,
  TRAINER  : 2,
  MEMBER  : 3,
}

export const USER_TYPE_OPTIONS = [
  { value: USER_TYPE.ADMIN , label: "Admin" },
  { value: USER_TYPE.TRAINER , label: "Trainer" },
  { value: USER_TYPE.MEMBER , label: "Member" },
]

export interface  UserTypeOption {
  value: number;
  label: string;
}


export const WEEKDAY = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

export const WEEKDAY_NAME = {
  [WEEKDAY.SUNDAY]: 'Sunday',
  [WEEKDAY.MONDAY]: 'Monday',
  [WEEKDAY.TUESDAY]: 'Tuesday',
  [WEEKDAY.WEDNESDAY]: 'Wednesday',
  [WEEKDAY.THURSDAY]: 'Thursday',
  [WEEKDAY.FRIDAY]: 'Friday',
  [WEEKDAY.SATURDAY]: 'Saturday'
};


export interface WeekDayOptionsI {
  value : number,
  label : string,
  isAvailable? : boolean;
}

export const WEEKDAY_OPTIONS = [
  { value: WEEKDAY.SUNDAY, label: WEEKDAY_NAME[WEEKDAY.SUNDAY] },
  { value: WEEKDAY.MONDAY, label: WEEKDAY_NAME[WEEKDAY.MONDAY] },
  { value: WEEKDAY.TUESDAY, label: WEEKDAY_NAME[WEEKDAY.TUESDAY] },
  { value: WEEKDAY.WEDNESDAY, label: WEEKDAY_NAME[WEEKDAY.WEDNESDAY] },
  { value: WEEKDAY.THURSDAY, label: WEEKDAY_NAME[WEEKDAY.THURSDAY] },
  { value: WEEKDAY.FRIDAY, label: WEEKDAY_NAME[WEEKDAY.FRIDAY] },
  { value: WEEKDAY.SATURDAY, label: WEEKDAY_NAME[WEEKDAY.SATURDAY] },
];

//  Support Ticket

export const SUPPORT_TICKET_USER_TYPE_OPTIONS = [
  { value: String(USER_TYPE.MEMBER) , label: "Member" },
  { value: String(USER_TYPE.TRAINER), label: "Trainer" },
]

export const SUPPORT_TICKET_STATUS = {
  PENDING : 'pending',
  REVIEWED  : 'reviewed',
  RESOLVED  : 'resolved',
}

export const SUPPORT_TICKET_STATUS_OPTIONS = [
  { value: String(SUPPORT_TICKET_STATUS.PENDING) , label: "Pending" },
  { value: String(SUPPORT_TICKET_STATUS.REVIEWED), label: "Reviewed" },
  { value: String(SUPPORT_TICKET_STATUS.RESOLVED), label: "Resolved" },
]


// Booking

export const BOOKING_STATUS = {
  PENDING : 'pending',
  CANCELED  : 'cancelled',
  COMPLETED  : 'completed',
}

export const BOOKING_STATUS_OPTIONS = [
  { value: BOOKING_STATUS.PENDING, label: "Pending" },
  { value: BOOKING_STATUS.CANCELED, label: "Cancelled" },
  { value: BOOKING_STATUS.COMPLETED, label: "Completed" },
]

export const BOOKING_STATUS_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'error' | 'success' }>  = {
  [BOOKING_STATUS.PENDING] : { value: BOOKING_STATUS.PENDING, label: "Pending" , color: 'warning'},
  [BOOKING_STATUS.CANCELED] : { value: BOOKING_STATUS.CANCELED, label: "Cancelled" , color: 'error'},
  [BOOKING_STATUS.COMPLETED] : { value: BOOKING_STATUS.COMPLETED, label: "Completed" , color: 'success'},

}


export const BOOKING_TYPE = {
  ONE_TIME : 'one_time',
  WEEKLY  : 'weekly',
}

export const BOOKING_TYPE_OPTIONS = [
  { value: BOOKING_TYPE.ONE_TIME, label: "One Time" },
  { value: BOOKING_TYPE.WEEKLY, label: "Weekly" },
]

export const BOOKING_TYPE_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'success' }> = {
  [BOOKING_TYPE.ONE_TIME] : { value: BOOKING_TYPE.ONE_TIME, label: "One Time" , color: 'warning'},
  [BOOKING_TYPE.WEEKLY] : { value: BOOKING_TYPE.WEEKLY, label: "Weekly" , color: 'success'},
}




export const GENDER_TYPE = {
  MALE : 'male',
  FEMALE  : 'female',
}

export const GENDER_TYPE_OPTIONS = [
  { value: GENDER_TYPE.MALE, label: "Male" },
  { value: GENDER_TYPE.FEMALE, label: "Female" },
]

export const GENDER_TYPE_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'success' }> = {
  [GENDER_TYPE.MALE] : { value: GENDER_TYPE.MALE, label: "Male" , color: 'warning'},
  [GENDER_TYPE.FEMALE] : { value: GENDER_TYPE.FEMALE, label: "Female" , color: 'success'},
}



export const BOOKING_PAYMENT_TYPE = {
  FULL : 'full',
  PER_SESSION  : 'per_session',
}

export const BOOKING_PAYMENT_TYPE_OPTIONS = [
  { value: BOOKING_PAYMENT_TYPE.FULL, label: "Full Payment" },
  { value: BOOKING_PAYMENT_TYPE.PER_SESSION, label: "Per Sesion Payment" },
]

export const BOOKING_PAYMENT_TYPE_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'success' }> = {
  [BOOKING_PAYMENT_TYPE.FULL] : { value: BOOKING_PAYMENT_TYPE.FULL, label: "Full" , color: 'warning'},
  [BOOKING_PAYMENT_TYPE.PER_SESSION] : { value: BOOKING_PAYMENT_TYPE.PER_SESSION, label: "Per Sesion" , color: 'success'},
}





export const BOOKING_PAYMENT_STATUS = {
  PENDING : 'pending',
  CANCELED  : 'cancelled',
  COMPLETED  : 'completed',
  PAID : 'paid'
}

export const BOOKING_PAYMENT_STATUS_OPTIONS = [
  { value: BOOKING_PAYMENT_STATUS.PENDING, label: "Pending" },
  { value: BOOKING_PAYMENT_STATUS.CANCELED, label: "Cancelled" },
  { value: BOOKING_PAYMENT_STATUS.COMPLETED, label: "Completed" },
  { value: BOOKING_PAYMENT_STATUS.PAID, label: "Paid" },
]

export const BOOKING_PAYMENT_STATUS_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'error' | 'success' }>  = {
  [BOOKING_PAYMENT_STATUS.PENDING] : { value: BOOKING_PAYMENT_STATUS.PENDING, label: "Pending" , color: 'warning'},
  [BOOKING_PAYMENT_STATUS.CANCELED] : { value: BOOKING_PAYMENT_STATUS.CANCELED, label: "Cancelled" , color: 'error'},
  [BOOKING_PAYMENT_STATUS.COMPLETED] : { value: BOOKING_PAYMENT_STATUS.COMPLETED, label: "Completed" , color: 'success'},
  [BOOKING_PAYMENT_STATUS.PAID] : { value: BOOKING_PAYMENT_STATUS.PAID, label: "Paid" , color: 'success'},
}



export const BOOKING_SESSION_STATUS = {
  IN_COMING : 'incoming',
  STARTED : 'started',
  COMPLETED : 'completed',
  CANCELLED : 'cancelled',

}

export const BOOKING_SESSION_STATUS_OPTIONS = [
  { value: BOOKING_SESSION_STATUS.IN_COMING, label: "In Coming" },
  { value: BOOKING_SESSION_STATUS.STARTED, label: "Started" },
  { value: BOOKING_SESSION_STATUS.CANCELLED, label: "Cancelled" },
  { value: BOOKING_SESSION_STATUS.COMPLETED, label: "Completed" },
]

export const BOOKING_SESSION_STATUS_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'error' | 'success' }>  = {
  [BOOKING_SESSION_STATUS.IN_COMING] : { value: BOOKING_SESSION_STATUS.IN_COMING, label: "Pending" , color: 'warning'},
  [BOOKING_SESSION_STATUS.STARTED] : { value: BOOKING_SESSION_STATUS.STARTED, label: "Started" , color: 'warning'},
  [BOOKING_SESSION_STATUS.COMPLETED] : { value: BOOKING_SESSION_STATUS.COMPLETED, label: "Completed" , color: 'success'},
  [BOOKING_SESSION_STATUS.CANCELLED] : { value: BOOKING_SESSION_STATUS.CANCELLED, label: "Cancelled" , color: 'error'},
}


export const BOOKING_SESSION_PAYMENT_STATUS = {
  PENDING : 'pending',
  CANCELED  : 'cancelled',
  COMPLETED  : 'completed',
}

export const BOOKING_SESSION_PAYMENT_STATUS_OPTIONS = [
  { value: BOOKING_SESSION_PAYMENT_STATUS.PENDING, label: "Pending" },
  { value: BOOKING_SESSION_PAYMENT_STATUS.CANCELED, label: "Cancelled" },
  { value: BOOKING_SESSION_PAYMENT_STATUS.COMPLETED, label: "Completed" },
]

export const BOOKING_SESSION_PAYMENT_STATUS_DETAILS: Record<string, { value: string; label: string; color: 'warning' | 'error' | 'success' }>  = {
  [BOOKING_SESSION_PAYMENT_STATUS.PENDING] : { value: BOOKING_SESSION_PAYMENT_STATUS.PENDING, label: "Pending" , color: 'warning'},
  [BOOKING_SESSION_PAYMENT_STATUS.CANCELED] : { value: BOOKING_SESSION_PAYMENT_STATUS.CANCELED, label: "Cancelled" , color: 'error'},
  [BOOKING_SESSION_PAYMENT_STATUS.COMPLETED] : { value: BOOKING_SESSION_PAYMENT_STATUS.COMPLETED, label: "Completed" , color: 'success'},

}

export const NOTIFICATION_TYPES = {
 
  NONE : 0,
   
  EMAIL : 1,
  PUSH_NOTIFICATION: 2,
   
  ADMIN_ALERT_NOTIFICATION:3,
  USER_ALERT_NOTIFICATION:4,
   
  ADMIN_PUSH_NOTIFICATION: 5,
  USER_PUSH_NOTIFICATION: 6
   
  }



export  const ExperienceOptions = [
    { value: 0, label: "None" }, // Option for no selection
    { value: 1, label: "0-1 Years" },
    { value: 2, label: "2-3 Years" },
    { value: 4, label: "4-5 Years" },
    { value: 6, label: "6-7 Years" },
    { value: 8, label: "8-9 Years" },
    { value: 10, label: "10+ Years" },
  ];


export const DateFormat = {
  dateFormat: 'YYYY-MM-DD'
}

