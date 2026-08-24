import { describe, expect, it } from 'vitest';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  validate,
  verifyOtpSchema,
} from '../validation';

describe('validation schemas', () => {
  describe('emailSchema', () => {
    it('accepts ordinary addresses and trims whitespace', () => {
      const [data] = validate(emailSchema, '  user@example.com ');
      expect(data).toBe('user@example.com');
    });

    it('rejects missing and malformed addresses with distinct messages', () => {
      expect(validate(emailSchema, '')[1]).toMatch(/enter your email/i);
      expect(validate(emailSchema, 'not-an-email')[1]).toMatch(/valid email/i);
    });
  });

  it('requestOtpSchema only needs a valid email', () => {
    expect(validate(requestOtpSchema, { email: 'a@b.co' })[0]).toEqual({ email: 'a@b.co' });
    expect(validate(requestOtpSchema, { email: 'nope' })[1]).toMatch(/valid email/i);
  });

  it('verifyOtpSchema requires both the address and the code', () => {
    expect(validate(verifyOtpSchema, { email: 'a@b.co', otp: '' })[1]).toMatch(/enter the otp/i);
    expect(validate(verifyOtpSchema, { email: 'a@b.co', otp: '123456' })[0]).toEqual({
      email: 'a@b.co',
      otp: '123456',
    });
  });

  it('loginSchema demands non-empty credentials', () => {
    expect(validate(loginSchema, { email: '', password: '' })[1]).toMatch(/email/i);
    expect(validate(loginSchema, { email: 'a@b.co', password: '' })[1]).toMatch(/password/i);
  });

  describe('registerSchema', () => {
    const base = {
      name: 'Shyan',
      email: 'a@b.co',
      password: 'hunter2x',
      confirmPassword: 'hunter2x',
    };

    it('accepts matching passwords', () => {
      const [data] = validate(registerSchema, base);
      expect(data.email).toBe('a@b.co');
      // confirmPassword is not part of what gets sent onward.
      expect(data).not.toHaveProperty('confirmPassword');
    });

    it('rejects mismatched confirmation', () => {
      expect(validate(registerSchema, { ...base, confirmPassword: 'different' })[1]).toBe(
        'Passwords do not match',
      );
    });

    it('enforces the length floor on passwords', () => {
      expect(
        validate(registerSchema, { ...base, password: 'abc', confirmPassword: 'abc' })[1],
      ).toBe('Password must be at least 6 characters long');
    });

    it('requires a real name of at least two characters', () => {
      expect(validate(registerSchema, { ...base, name: ' ' })[1]).toMatch(/name/i);
    });
  });
});
