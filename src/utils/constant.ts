export const REGEX_VALIDATION = {
    FULL_NAME : /^[A-Za-z\s]+$/, //Full name can only contain letters and spaces!
    ZIP_CODE  : /^[0-9]+$/, // Zip code must contain only numeric digits without any letters or special characters,
    PHONE_NUMBER : /^\(?\+?1?\)?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/ // Phone number must be a valid US number
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