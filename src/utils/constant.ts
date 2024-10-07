export const REGEX_VALIDATION = {
    FULL_NAME : /^[A-Za-z\s]+$/, //Full name can only contain letters and spaces!
    ZIP_CODE  : /^[0-9]+$/, // Zip code must contain only numeric digits without any letters or special characters,
    PHONE_NUMBER : /^\(?\+?1?\)?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/ // Phone number must be a valid US number
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

// Other

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

