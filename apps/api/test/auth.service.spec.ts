import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthService, USERS_REPOSITORY } from "../src/auth/auth.service.js";
import type { AppUser, UsersRepositoryPort } from "../src/auth/users.repository.js";

import { MailService } from "../src/common/mail/mail.service.js";
import { R2StorageService } from "../src/common/storage/r2-storage.service.js";

// Import mocked functions (Jest auto-mocks via __mocks__ folder)
import {
  startOtp,
  verifyOtp,
  signInOrCreateUser,
  mintCustomToken,
  adminAuth,
} from "@cottonbro/auth-server";

// Type the mocked functions
type MockedFn<T extends (...args: any[]) => any> = jest.Mock<T>;
const mockedStartOtp = startOtp as MockedFn<typeof startOtp>;
const mockedVerifyOtp = verifyOtp as MockedFn<typeof verifyOtp>;
const mockedSignInOrCreateUser = signInOrCreateUser as MockedFn<
  typeof signInOrCreateUser
>;
const mockedMintCustomToken = mintCustomToken as MockedFn<
  typeof mintCustomToken
>;
const mockedAdminAuth = adminAuth as {
  createSessionCookie: jest.Mock<(idToken: string, options: any) => Promise<string>>;
  getUser: jest.Mock<(uid: string) => Promise<any>>;
  verifyIdToken: jest.Mock<(idToken: string, checkRevoked?: boolean) => Promise<any>>;
};

describe("AuthService", () => {
  let authService: AuthService;
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
          provide: MailService,
          useValue: {
            sendOtpEmail: jest
              .fn<() => Promise<void>>()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: R2StorageService,
          useValue: {
            uploadBase64Image: jest.fn(),
            deleteObject: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mailService = module.get<MailService>(MailService);
    process.env.TURNSTILE_SECRET = "test-turnstile-secret";
  });

  describe("startOtp", () => {
    const mockCaptchaSuccess = () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
    };

    it("should throw BadRequestException if email is empty", async () => {
      await expect(authService.startOtp("", "captcha-token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if captcha token is missing", async () => {
      await expect(
        authService.startOtp("test@example.com", ""),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if captcha verification fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as Response);

      await expect(
        authService.startOtp("test@example.com", "invalid-captcha"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should call startOtp and sendOtpEmail on success", async () => {
      mockCaptchaSuccess();
      mockedStartOtp.mockResolvedValueOnce("123456");

      await authService.startOtp("test@example.com", "valid-captcha");

      expect(mockedStartOtp).toHaveBeenCalledWith("test@example.com");
      expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
      );
    });
  });

  describe("verifyOtpAndMintCustomToken", () => {
    it("should throw BadRequestException if email is empty", async () => {
      await expect(
        authService.verifyOtpAndMintCustomToken("", "123456"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if code is empty", async () => {
      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", ""),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw UnauthorizedException for invalid OTP", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("otp_invalid"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "wrong"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for expired OTP", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("otp_expired"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "expired"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return custom token on successful verification", async () => {
      mockedVerifyOtp.mockResolvedValueOnce(undefined);
      mockedSignInOrCreateUser.mockResolvedValueOnce({
        uid: "user-123",
      } as any);
      mockedMintCustomToken.mockResolvedValueOnce("custom-token-abc");

      const result = await authService.verifyOtpAndMintCustomToken(
        "test@example.com",
        "123456",
      );

      expect(result).toBe("custom-token-abc");
      expect(mockedVerifyOtp).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
      );
      expect(mockedSignInOrCreateUser).toHaveBeenCalledWith("test@example.com");
      expect(mockedMintCustomToken).toHaveBeenCalledWith("user-123");
    });

    it("should throw InternalServerErrorException for unexpected errors", async () => {
      mockedVerifyOtp.mockRejectedValueOnce(new Error("database_error"));

      await expect(
        authService.verifyOtpAndMintCustomToken("test@example.com", "123456"),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("createSessionCookie", () => {
    it("should throw BadRequestException when id token is missing", async () => {
      const res = createMockResponse();

      await expect(authService.createSessionCookie("", res)).rejects.toThrow(
        BadRequestException,
      );
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should verify the Firebase ID token and set the HttpOnly session cookie", async () => {
      const res = createMockResponse();
      mockedAdminAuth.verifyIdToken.mockResolvedValueOnce({
        uid: "user-123",
      });
      mockedAdminAuth.getUser.mockResolvedValueOnce({
        uid: "user-123",
        email: "test@example.com",
        emailVerified: true,
      });
      mockedAdminAuth.createSessionCookie.mockResolvedValueOnce(
        "session-cookie",
      );

      await authService.createSessionCookie("id-token", res);

      expect(mockedAdminAuth.verifyIdToken).toHaveBeenCalledWith(
        "id-token",
        true,
      );
      expect(mockedAdminAuth.createSessionCookie).toHaveBeenCalledWith(
        "id-token",
        { expiresIn: 14 * 24 * 60 * 60 * 1000 },
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "__session",
        "session-cookie",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }),
      );
    });

    it("should throw UnauthorizedException and avoid setting a cookie when Firebase rejects the token", async () => {
      const res = createMockResponse();
      mockedAdminAuth.verifyIdToken.mockRejectedValueOnce(
        new Error("invalid_token"),
      );

      await expect(
        authService.createSessionCookie("bad-id-token", res),
      ).rejects.toThrow(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe("logoutAndRevoke", () => {
    it("should clear the backend session cookie", async () => {
      const res = createMockResponse();

      await authService.logoutAndRevoke(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "__session",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }),
      );
    });
  });

  describe("role-protected account settings", () => {
    it("should allow regular users to read account settings", async () => {
      const repository = createUsersRepository({
        findByFirebaseUidOrEmail: jest
          .fn()
          .mockResolvedValueOnce(createActiveUser({ role: "user" })),
      });
      const service = await createAuthService({ repository });

      await expect(
        service.getAccountSettings({
          uid: "user-123",
          email: "test@example.com",
        }),
      ).resolves.toMatchObject({
        marketingEmailsEnabled: false,
      });
    });

    it("should reject partners reading account settings", async () => {
      const repository = createUsersRepository({
        findByFirebaseUidOrEmail: jest
          .fn()
          .mockResolvedValueOnce(createActiveUser({ role: "partner" })),
      });
      const service = await createAuthService({ repository });

      await expect(
        service.getAccountSettings({
          uid: "user-123",
          email: "test@example.com",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should reject admins updating marketing settings", async () => {
      const repository = createUsersRepository({
        findByFirebaseUidOrEmail: jest
          .fn()
          .mockResolvedValueOnce(createActiveUser({ role: "admin" })),
        updateMarketingEmailConsent: jest.fn(),
      });
      const service = await createAuthService({ repository });

      await expect(
        service.updateMarketingEmailConsent(
          {
            uid: "user-123",
            email: "test@example.com",
          },
          true,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.updateMarketingEmailConsent).not.toHaveBeenCalled();
    });

    it("should reject partners deleting an account", async () => {
      const repository = createUsersRepository({
        findByFirebaseUidOrEmail: jest
          .fn()
          .mockResolvedValueOnce(createActiveUser({ role: "partner" })),
        softDeleteUser: jest.fn(),
      });
      const service = await createAuthService({ repository });

      await expect(
        service.deleteAccount(
          {
            uid: "user-123",
            email: "test@example.com",
          },
          createMockResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.softDeleteUser).not.toHaveBeenCalled();
    });
  });
});

async function createAuthService({
  repository,
}: {
  repository: jest.Mocked<UsersRepositoryPort>;
}) {
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: MailService,
        useValue: {
          sendOtpEmail: jest.fn<() => Promise<void>>().mockResolvedValue(
            undefined,
          ),
          sendAccountReinstatementEmail: jest
            .fn<() => Promise<void>>()
            .mockResolvedValue(undefined),
          sendWelcomeEmail: jest.fn<() => Promise<void>>().mockResolvedValue(
            undefined,
          ),
        },
      },
      {
        provide: R2StorageService,
        useValue: {
          uploadBase64Image: jest.fn(),
          deleteObject: jest.fn(),
        },
      },
      {
        provide: USERS_REPOSITORY,
        useValue: repository,
      },
    ],
  }).compile();

  return module.get<AuthService>(AuthService);
}

function createUsersRepository(
  overrides: Partial<jest.Mocked<UsersRepositoryPort>> = {},
): jest.Mocked<UsersRepositoryPort> {
  return {
    findByEmail: jest.fn(),
    findByFirebaseUidOrEmail: jest.fn(),
    upsertFromFirebaseUser: jest.fn(),
    updateMarketingEmailConsent: jest.fn(),
    updateName: jest.fn(),
    updatePhoneNumber: jest.fn(),
    updateAvatarUrl: jest.fn(),
    updateEmail: jest.fn(),
    softDeleteUser: jest.fn(),
    createAccountReinstatementToken: jest.fn(),
    restoreDeletedUserByTokenHash: jest.fn(),
    ...overrides,
  };
}

function createActiveUser(overrides: Partial<AppUser> = {}): AppUser {
  const now = new Date();
  return {
    id: "local-user-123",
    firebaseUid: "user-123",
    email: "test@example.com",
    emailVerified: true,
    phoneNumber: null,
    name: null,
    avatarUrl: null,
    avatarObjectKey: null,
    status: "active",
    role: "user",
    privacyPolicyAcceptedAt: now,
    termsAcceptedAt: now,
    marketingEmailsOptedInAt: null,
    marketingEmailsOptedOutAt: null,
    deletedAt: null,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createMockResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;
}
