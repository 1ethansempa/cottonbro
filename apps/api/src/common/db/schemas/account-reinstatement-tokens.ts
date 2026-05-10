import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const accountReinstatementTokens = pgTable(
  "account_reinstatement_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("account_reinstatement_tokens_token_hash_idx").on(
      table.tokenHash,
    ),
    index("account_reinstatement_tokens_user_id_idx").on(table.userId),
    index("account_reinstatement_tokens_expires_at_idx").on(table.expiresAt),
  ],
);
