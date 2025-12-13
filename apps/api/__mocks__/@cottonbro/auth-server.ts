import { jest } from "@jest/globals";

// Mock Firebase Admin Auth
export const adminAuth = {
  createSessionCookie: jest.fn(),
  revokeRefreshTokens: jest.fn(),
  verifyIdToken: jest.fn(),
  verifySessionCookie: jest.fn(),
};

// Mock OTP functions
export const startOtp = jest.fn();
export const verifyOtp = jest.fn();
export const signInOrCreateUser = jest.fn();
export const mintCustomToken = jest.fn();
