export const REGEX_VALIDATION = {
    FULL_NAME : /^[A-Za-z\s]+$/, //Full name can only contain letters and spaces!
    ZIP_CODE  : /^[0-9]+$/, // Zip code must contain only numeric digits without any letters or special characters,
    PHONE_NUMBER : /^\(?\+?1?\)?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/ // Phone number must be a valid US number
  }