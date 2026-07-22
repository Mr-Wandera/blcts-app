// Maps Supabase AuthError messages to user-friendly text.
// Supabase returns generic messages; we translate them to specific, actionable ones.

export interface AuthErrorInfo {
  message: string;
  needsVerification?: boolean;
}

export function mapAuthError(err: unknown): AuthErrorInfo {
  if (!err) return { message: 'An unexpected error occurred.' };

  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  // Supabase error messages are fairly stable strings.
  if (lower.includes('email not confirmed')) {
    return { message: 'Your email has not been verified. Please check your inbox or resend the verification email.', needsVerification: true };
  }
  if (lower.includes('invalid login credentials')) {
    return { message: 'Incorrect email or password. Please try again.' };
  }
  if (lower.includes('user not found')) {
    return { message: 'No account found with this email address.' };
  }
  if (lower.includes('invalid password') || lower.includes('incorrect password')) {
    return { message: 'Incorrect password. Please try again.' };
  }
  if (lower.includes('email already registered') || lower.includes('user already registered')) {
    return { message: 'An account with this email already exists. Please sign in instead.' };
  }
  if (lower.includes('password should be at least') || lower.includes('password must be at least')) {
    return { message: 'Password must be at least 6 characters long.' };
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email')) {
    return { message: 'Please enter a valid email address.' };
  }
  if (lower.includes('signup disabled') || lower.includes('signups not allowed')) {
    return { message: 'New account registration is currently disabled.' };
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('too many attempts')) {
    return { message: 'Too many attempts. Please wait a moment before trying again.' };
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('fetch')) {
    return { message: 'Network error. Please check your internet connection and try again.' };
  }
  if (lower.includes('session expired') || lower.includes('session not found')) {
    return { message: 'Your session has expired. Please sign in again.' };
  }
  if (lower.includes('expired') || lower.includes('token')) {
    return { message: 'This link has expired. Please request a new one.' };
  }

  // Fall back to the raw message if it's reasonably descriptive, otherwise generic.
  if (raw.length > 0 && raw.length < 200) {
    return { message: raw };
  }
  return { message: 'Authentication failed. Please try again.' };
}
