import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { adminAuth } from "@cottonbro/auth-server";
import { AuthGuard } from "../src/auth/auth.guard.js";
import type { AppUser, UsersRepositoryPort } from "../src/auth/users.repository.js";

type MockedAdminAuth = {
  verifyIdToken: jest.Mock<(token: string, checkRevoked?: boolean) => Promise<any>>;
  verifySessionCookie: jest.Mock<
    (sessionCookie: string, checkRevoked?: boolean) => Promise<any>
  >;
};

const mockedAdminAuth = adminAuth as MockedAdminAuth;

describe("AuthGuard", () => {
  let repository: jest.Mocked<UsersRepositoryPort>;
  let guard: AuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
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
    };

    guard = new AuthGuard(
      {
        getAllAndOverride: jest.fn(() => false),
      } as any,
      repository,
    );
  });

  it("should reject protected requests without a session cookie or bearer token", async () => {
    await expect(
      guard.canActivate(createContext({ headers: {}, cookies: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should accept a valid session cookie and attach role-enriched claims", async () => {
    const request = {
      headers: {},
      cookies: { __session: "session-cookie" },
    };
    mockedAdminAuth.verifySessionCookie.mockResolvedValueOnce({
      uid: "user-123",
      email: "test@example.com",
    });
    repository.findByFirebaseUidOrEmail.mockResolvedValueOnce(
      createActiveUser({ role: "partner" }),
    );

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(mockedAdminAuth.verifySessionCookie).toHaveBeenCalledWith(
      "session-cookie",
      true,
    );
    expect(request).toMatchObject({
      user: {
        uid: "user-123",
        email: "test@example.com",
        role: "partner",
      },
    });
  });

  it("should reject invalid session cookies", async () => {
    mockedAdminAuth.verifySessionCookie.mockRejectedValueOnce(
      new Error("invalid_session"),
    );

    await expect(
      guard.canActivate(
        createContext({
          headers: {},
          cookies: { __session: "bad-session-cookie" },
        }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should reject inactive or incomplete local accounts even with a valid Firebase session", async () => {
    mockedAdminAuth.verifySessionCookie.mockResolvedValueOnce({
      uid: "user-123",
      email: "test@example.com",
    });
    repository.findByFirebaseUidOrEmail.mockResolvedValueOnce(
      createActiveUser({
        status: "deleted",
        deletedAt: new Date(),
      }),
    );

    await expect(
      guard.canActivate(
        createContext({
          headers: {},
          cookies: { __session: "session-cookie" },
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should reject stale bearer tokens", async () => {
    const staleIssuedAt = Math.floor(Date.now() / 1000) - 21 * 60;
    mockedAdminAuth.verifyIdToken.mockResolvedValueOnce({
      uid: "user-123",
      email: "test@example.com",
      iat: staleIssuedAt,
    });

    await expect(
      guard.canActivate(
        createContext({
          headers: { authorization: "Bearer id-token" },
          cookies: {},
        }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });
});

function createContext(request: Record<string, any>) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
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
