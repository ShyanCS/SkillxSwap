import { z } from 'zod';

// Single source of truth for client-side form validation. The backend
// re-validates everything (Bean Validation); these schemas exist so the
// user gets precise, consistent messages before a request is spent, and so
// validation rules live in one reviewed place instead of scattered regexes.

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Please enter your email address')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password must be at most 128 characters long');

export const otpCodeSchema = z.string().trim().min(1, 'Please enter the OTP');

export const requestOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpCodeSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Please enter your password'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(80, 'Name must be at most 80 characters long'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  // The confirmation never travels onward -- only validated fields remain.
  .transform(({ confirmPassword, ...registration }) => registration);

/**
 * Runs `schema.safeParse` and returns [data, firstErrorMessage].
 * The page layer only needs the first violation to show inline.
 */
export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return [result.data, ''];
  return [null, result.error.issues[0].message];
}
