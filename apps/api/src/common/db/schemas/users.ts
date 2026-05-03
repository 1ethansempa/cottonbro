import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Postgres enum for account lifecycle state. Drizzle will create this as
// a database enum type named "user_status".
export const userStatus = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
  "deleted",
]);

//unique attributes have a fast lookup

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firebaseUid: text("firebase_uid").notNull().unique(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(true),
    // Optional profile fields. Because these columns do not use .notNull(),
    // Postgres stores NULL when the app inserts no value for them.
    phoneNumber: text("phone_number"),
    name: text("name"),
    status: userStatus("status").notNull().default("active"),
    // Soft-delete marker. A NULL deleted_at means the user is not deleted.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("users_status_idx").on(table.status),
    index("users_deleted_at_idx").on(table.deletedAt),
  ],
);
