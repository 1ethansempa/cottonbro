import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthService } from "../src/auth/auth.service.js";
import { ConfigService } from "../src/common/config/config.service.js";
import { MailService } from "../src/common/mail/mail.service.js";

// Import mocked functions (Jest auto-mocks via __mocks__ folder)
import {
  startOtp,
  verifyOtp,
  signInOrCreateUser,
  mintCustomToken,
} from "@cottonbro/auth-server";

// Type the mocked functions
type MockedFn<T extends (...args: any[]) => any> = jest.Mock<T>;
const mockedStartOtp = startOtp as MockedFn<typeof startOtp>;
const mockedVerifyOtp = verifyOtp as MockedFn<typeof verifyOtp>;
const mockedSignInOrCreateUser = signInOrCreateUser as MockedFn<typeof signInOrCreateUser>;
const mockedMintCustomToken = mintCustomToken as MockedFn<typeof mintCustomToken>;

describe("AuthService", () => {
  let authService: AuthService;
  let configService: ConfigService;
  let mailService: MailService;

  // Mock fetch globally with proper typing
  const mockFetch = jest.fn<typeof fetch>();
  global.fetch = mockFetch as typeof fetch;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            TURNSTILE_SECRET: "test-turnstile-secret",
          },
        },
        {
          provide: MailService,
          useValue: {
            sendOtpEmail: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MailService>(MailService);
  });

  describe("startOtp", () => {
    const mockCaptchaSuccess = () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
    };

    it("should throw BadRequestException if email is empty", async () => {
      await expect(
        authService.startOtp("", "captcha-token")
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if captcha token is missing", async () => {
      await expect(
        authService.startOtp("test@example.com", "")
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if captcha verification fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as Response);

      await expect(
        authService.startOtp("test@example.com", "invalid-captcha")
      ).rejects.toThrow(BadRequestException);
    });

    it("should call startOtp and sendOtpEmail on success", async () => {
      mockCaptchaSuccess();
      mockedStartOtp.mockResolvedValueOnce("123456");

      await authService.startOtp("test@example.com", "valid-captcha");

      expect(mockedStartOtp).toHaveBeenCalledWith("test@example.com");
      expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456"
      );
    });
  });

  describe("verifyOtpAndMintCustomToken", () => {
    it("should throw BadRequestException if email is empty", async () => {
      await expect(
        authService.verifyOtpAndMintCustomToken("", "123456")
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if code is empty", async () => {
      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "")
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw UnauthorizedException for invalid OTP", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("otp_invalid"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "wrong")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for expired OTP", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("otp_expired"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "expired")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return custom token on successful verification", async () => {
      mockedVerifyOtp.mockResolvedValueOnce(undefined);
      mockedSignInOrCreateUser.mockResolvedValueOnce({ uid: "user-123" } as any);
      mockedMintCustomToken.mockResolvedValueOnce("custom-token-abc");

      const result = await authService.verifyOtpAndMintCustomToken(
        "test@example.com",
        "123456"
      );

      expect(result).toBe("custom-token-abc");
      expect(mockedVerifyOtp).toHaveBeenCalledWith("test@example.com", "123456");
      expect(mockedSignInOrCreateUser).toHaveBeenCalledWith("test@example.com");
      expect(mockedMintCustomToken).toHaveBeenCalledWith("user-123");
    });

    it("should throw InternalServerErrorException for unexpected errors", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("database_error"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "123456")
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
