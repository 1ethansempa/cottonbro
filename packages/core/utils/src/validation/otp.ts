export const OTP_CODE_PATTERN = /^\d{6}$/;

export function normalizeOtp(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

export function isValidOtp(code: string) {
  return OTP_CODE_PATTERN.test(code);
}
