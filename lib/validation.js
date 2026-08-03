const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const isRequired = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  EMAIL_REGEX.test(value.trim());

export const isName = (value) => {
  if (typeof value !== "string") return false;
  const name = value.trim();
  return name.length >= 2 && name.length <= 50;
};

export const isPassword = (value) => {
  if (typeof value !== "string") return false;
  if (value.length < 8 || value.length > 72) return false;
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return false;
  return true;
};

export const isTitle = (value) => {
  if (typeof value !== "string") return false;
  const title = value.trim();
  return title.length >= 2 && title.length <= 200;
};

export const isDescription = (value) =>
  typeof value === "string" && value.trim().length <= 5000;

export const isObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value);

export const isNonNegativeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
};

export const isPositiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
};

export const isArrayOfStrings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** Validate registration payload. Returns an object of field errors. */
export const validateRegistration = ({ name, email, password }) => {
  const errors = {};
  if (!isName(name))
    errors.name = "Name must be between 2 and 50 characters.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPassword(password))
    errors.password =
      "Password must be at least 8 characters and include a letter and a number.";
  return errors;
};

/** Validate login payload. Returns an object of field errors. */
export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!isRequired(email)) errors.email = "Email is required.";
  if (!isRequired(password)) errors.password = "Password is required.";
  return errors;
};

export const isCouponCode = (value) =>
  typeof value === "string" && /^[A-Za-z0-9_-]{3,50}$/.test(value.trim());

/** Validate a contact message payload. */
export const validateContactMessage = ({ name, email, subject, message }) => {
  const errors = {};
  if (!isRequired(name) || name.trim().length > 100)
    errors.name = "Please enter your name (max 100 characters).";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isRequired(subject) || subject.trim().length > 200)
    errors.subject = "Please enter a subject (max 200 characters).";
  if (!isRequired(message) || message.trim().length > 5000)
    errors.message = "Message must be between 1 and 5000 characters.";
  return errors;
};

/** Validate a product review payload. */
export const validateReview = ({ rating, comment }) => {
  const errors = {};
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5)
    errors.rating = "Rating must be a whole number between 1 and 5.";
  if (comment !== undefined && typeof comment === "string" && comment.trim().length > 2000)
    errors.comment = "Comment cannot exceed 2000 characters.";
  return errors;
};
