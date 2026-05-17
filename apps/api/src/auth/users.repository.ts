import { Injectable } from "@nestjs/common";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { normalizeEmail } from "@cottonplug/utils";
import { db } from "../common/db/sql.js";
import { accountReinstatementTokens, users } from "../common/db/schema.js";

export type UserStatus = "active" | "suspended" | "banned" | "deleted";
export type UserRole = "admin" | "user" | "partner";

export type AppUser = {
  id: string;
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  name: string | null;
  avatarUrl: string | null;
  avatarObjectKey: string | null;
  status: UserStatus;
  role: UserRole;
  privacyPolicyAcceptedAt: Date | null;
  termsAcceptedAt: Date | null;
  marketingEmailsOptedInAt: Date | null;
  marketingEmailsOptedOutAt: Date | null;
  deletedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface UsersRepositoryPort {
  findByEmail(email: string): Promise<AppUser | null>;
  findByFirebaseUidOrEmail(uid: string, email?: string): Promise<AppUser | null>;
  upsertFromFirebaseUser(
    user: FirebaseUserProfile,
    agreements?: LegalAgreementInput,
  ): Promise<AppUser>;
  updateMarketingEmailConsent(args: {
    uid: string;
    email?: string;
    enabled: boolean;
  }): Promise<AppUser | null>;
  updateName(args: {
    uid: string;
    email?: string;
    name: string;
  }): Promise<AppUser | null>;
  updatePhoneNumber(args: {
    uid: string;
    email?: string;
    phoneNumber: string | null;
  }): Promise<AppUser | null>;
  updateAvatarUrl(args: {
    uid: string;
    email?: string;
    avatarUrl: string | null;
    avatarObjectKey?: string | null;
  }): Promise<AppUser | null>;
  updateEmail(args: {
    uid: string;
    email?: string;
    newEmail: string;
  }): Promise<AppUser | null>;
  softDeleteUser(args: { uid: string; email?: string }): Promise<AppUser | null>;
  createAccountReinstatementToken(args: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  restoreDeletedUserByTokenHash(tokenHash: string): Promise<AppUser | null>;
}

type FirebaseUserProfile = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
};

export type LegalAgreementInput = {
  privacyPolicyAccepted?: boolean;
  termsAccepted?: boolean;
};

@Injectable()
export class UsersRepository implements UsersRepositoryPort {
  async findByEmail(email: string): Promise<AppUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);

    return user ?? null;
  }

  async findByFirebaseUidOrEmail(
    uid: string,
    email?: string,
  ): Promise<AppUser | null> {
    const normalizedEmail = email ? normalizeEmail(email) : undefined;
    const [user] = await db
      .select()
      .from(users)
      .where(
        normalizedEmail
          ? or(eq(users.firebaseUid, uid), eq(users.email, normalizedEmail))
          : eq(users.firebaseUid, uid),
      )
      .limit(1);

    return user ?? null;
  }

  async upsertFromFirebaseUser(
    user: FirebaseUserProfile,
    agreements?: LegalAgreementInput,
  ): Promise<AppUser> {
    const now = new Date();
    const email = user.email ? normalizeEmail(user.email) : undefined;

    if (!email) {
      throw new Error("firebase_user_missing_email");
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.firebaseUid, user.uid), eq(users.email, email)))
      .limit(1);

    if (existing) {
      const privacyPolicyAcceptedAt =
        existing.privacyPolicyAcceptedAt ??
        (agreements?.privacyPolicyAccepted ? now : null);
      const termsAcceptedAt =
        existing.termsAcceptedAt ?? (agreements?.termsAccepted ? now : null);

      const [updated] = await db
        .update(users)
        .set({
          firebaseUid: user.uid,
          email,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber ?? existing.phoneNumber,
          name: user.displayName ?? existing.name,
          avatarUrl: user.photoURL ?? existing.avatarUrl,
          avatarObjectKey: user.photoURL ? null : existing.avatarObjectKey,
          privacyPolicyAcceptedAt,
          termsAcceptedAt,
          lastLoginAt: now,
          updatedAt: now,
        })
        .where(eq(users.id, existing.id))
        .returning();

      if (!updated) {
        throw new Error("user_update_failed");
      }

      return updated;
    }

    const [created] = await db
      .insert(users)
      .values({
        firebaseUid: user.uid,
        email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber ?? null,
        name: user.displayName ?? null,
        avatarUrl: user.photoURL ?? null,
        avatarObjectKey: null,
        privacyPolicyAcceptedAt: agreements?.privacyPolicyAccepted ? now : null,
        termsAcceptedAt: agreements?.termsAccepted ? now : null,
        lastLoginAt: now,
      })
      .returning();

    if (!created) {
      throw new Error("user_create_failed");
    }

    return created;
  }

  async updateMarketingEmailConsent(args: {
    uid: string;
    email?: string;
    enabled: boolean;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const now = new Date();
    const [updated] = await db
      .update(users)
      .set({
        marketingEmailsOptedInAt: args.enabled
          ? now
          : existing.marketingEmailsOptedInAt,
        marketingEmailsOptedOutAt: args.enabled ? null : now,
        updatedAt: now,
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async updateName(args: {
    uid: string;
    email?: string;
    name: string;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const [updated] = await db
      .update(users)
      .set({
        name: args.name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async updatePhoneNumber(args: {
    uid: string;
    email?: string;
    phoneNumber: string | null;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const [updated] = await db
      .update(users)
      .set({
        phoneNumber: args.phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async updateAvatarUrl(args: {
    uid: string;
    email?: string;
    avatarUrl: string | null;
    avatarObjectKey?: string | null;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const [updated] = await db
      .update(users)
      .set({
        avatarUrl: args.avatarUrl,
        avatarObjectKey: args.avatarObjectKey ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async updateEmail(args: {
    uid: string;
    email?: string;
    newEmail: string;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const [updated] = await db
      .update(users)
      .set({
        email: normalizeEmail(args.newEmail),
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async softDeleteUser(args: {
    uid: string;
    email?: string;
  }): Promise<AppUser | null> {
    const existing = await this.findByFirebaseUidOrEmail(args.uid, args.email);
    if (!existing) return null;

    const now = new Date();
    const [updated] = await db
      .update(users)
      .set({
        status: "deleted",
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated ?? null;
  }

  async createAccountReinstatementToken(args: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await db.insert(accountReinstatementTokens).values({
      userId: args.userId,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
    });
  }

  async restoreDeletedUserByTokenHash(tokenHash: string): Promise<AppUser | null> {
    const now = new Date();
    const [token] = await db
      .update(accountReinstatementTokens)
      .set({ usedAt: now })
      .where(
        and(
          eq(accountReinstatementTokens.tokenHash, tokenHash),
          isNull(accountReinstatementTokens.usedAt),
          gt(accountReinstatementTokens.expiresAt, now),
        ),
      )
      .returning();

    if (!token) {
      return null;
    }

    const [restored] = await db
      .update(users)
      .set({
        status: "active",
        deletedAt: null,
        updatedAt: now,
      })
      .where(and(eq(users.id, token.userId), eq(users.status, "deleted")))
      .returning();

    return restored ?? null;
  }
}
