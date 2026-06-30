import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhone,
  validateConfirmPassword,
} from './authValidation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('not-an-email')).toMatch(/valid email/);
  });

  it('accepts a valid address', () => {
    expect(validateEmail('patient@example.com')).toBe('');
  });

  it('uses a custom label', () => {
    expect(validateEmail('', 'Official Email')).toBe('Official Email is required.');
  });
});

describe('validatePassword', () => {
  it('requires a value', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('rejects passwords without a digit', () => {
    expect(validatePassword('lettersonly')).toMatch(/at least 8 characters/);
  });

  it('rejects passwords shorter than 8 chars', () => {
    expect(validatePassword('ab1')).toMatch(/at least 8 characters/);
  });

  it('accepts a valid password', () => {
    expect(validatePassword('Passw0rd!')).toBe('');
  });
});

describe('validateRequired', () => {
  it('flags empty/whitespace-only values', () => {
    expect(validateRequired('   ', 'Full name')).toBe('Full name is required.');
  });

  it('passes a non-empty value', () => {
    expect(validateRequired('Jane', 'Full name')).toBe('');
  });
});

describe('validatePhone', () => {
  it('requires a value', () => {
    expect(validatePhone('')).toBe('Phone number is required.');
  });

  it('rejects too-short numbers', () => {
    expect(validatePhone('123')).toMatch(/valid phone number/);
  });

  it('accepts numbers with spaces and a leading +', () => {
    expect(validatePhone('+49 152 2636 4308')).toBe('');
  });
});

describe('validateConfirmPassword', () => {
  it('requires confirmation', () => {
    expect(validateConfirmPassword('Passw0rd!', '')).toBe('Confirm password is required.');
  });

  it('rejects mismatches', () => {
    expect(validateConfirmPassword('Passw0rd!', 'Different1')).toBe('Passwords do not match.');
  });

  it('accepts a match', () => {
    expect(validateConfirmPassword('Passw0rd!', 'Passw0rd!')).toBe('');
  });
});
