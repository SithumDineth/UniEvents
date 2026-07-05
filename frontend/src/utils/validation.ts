
// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength: at least 8 chars, 1 letter, 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

// Phone number (basic validation)
const PHONE_REGEX = /^[+]?[1-9]\d{0,2}[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) return { isValid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { isValid: false, error: 'Password is required' };
  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error:
        'Password must be at least 8 characters long and include at least one letter and one number',
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) return { isValid: false, error: 'Name is required' };
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) return { isValid: true }; // Optional
  if (!PHONE_REGEX.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validateNumber = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  const num = parseInt(value, 10);
  if (!value || isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { isValid: true };
};
