import { parseArgs } from "node:util";
import { config } from "dotenv";
import { eq, or } from "drizzle-orm";
import { users } from "../common/db/schema.js";
import type { UserRole } from "../auth/users.repository.js";

const ROLES = ["admin", "user", "partner"] as const;
const ENVS = ["local", "qa", "prod"] as const;

// This is a CLI admin script for changing a user’s role in two places:
// The app database, in the users.role column.
// Firebase Auth custom claims, in customClaims.role

async function main() {
  // The script accepts these flags
  // It requires exactly one identifier: either --email or --uid.
  const { values: flags } = parseArgs({
    args: process.argv.slice(2),
    options: {
      email: { type: "string" },
      uid: { type: "string" },
      env: { type: "string" },
      role: { type: "string" },
      confirm: { type: "boolean", default: false },
    },
    strict: true,
  });

  // validates env
  const env = flags.env as (typeof ENVS)[number];
  if (!env || !ENVS.includes(env)) {
    die("--env must be local, qa, or prod");
  }

  // validates role
  const role = flags.role as UserRole;
  if (!role || !ROLES.includes(role as (typeof ROLES)[number])) {
    die("--role must be admin, user, or partner");
  }

  if (flags.email && flags.uid) {
    die("pick one: --email or --uid");
  }

  if (!flags.email && !flags.uid) {
    die("need --email or --uid");
  }

  const email = flags.email?.trim().toLowerCase();

  // Load env files — overlay the target env on top of local defaults.
  config({ path: ".env.local" });

  if (env !== "local") {
    config({ path: `.env.${env}.local`, override: true });
  }

  for (const key of [
    "DATABASE_URL",
    "FIREBASE_ADMIN_JSON",
    "FIREBASE_PROJECT_ID",
  ]) {
    if (!process.env[key]?.trim()) {
      die(`missing ${key} in env`);
    }
  }

  // That is intentional.
  //  Both modules initialize from environment variables at import time.
  // If the script imported them at the top, they might read env vars
  // before dotenv loaded the right files.
  const { db } = await import("../common/db/sql.js");
  const { adminAuth } = await import("@cottonbro/auth-server");

  // Look up by UID directly, or try both email and UID columns.
  const where = flags.uid
    ? eq(users.firebaseUid, flags.uid)
    : or(eq(users.email, email!), eq(users.firebaseUid, flags.email!));

  const rows = await db.select().from(users).where(where).limit(2);

  if (rows.length === 0) {
    die("no user found");
  }

  if (rows.length > 1) {
    die("ambiguous — matched multiple users, use --uid");
  }

  const user = rows[0]!;

  if (user.status !== "active" || user.deletedAt) {
    die(`account is ${user.status}`);
  }

  if (!user.emailVerified) {
    die("email not verified");
  }

  if (!user.privacyPolicyAcceptedAt || !user.termsAcceptedAt) {
    die("required agreements not accepted");
  }

  const fbUser = await adminAuth.getUser(user.firebaseUid);
  const oldRole = fbUser.customClaims?.role ?? "(none)";

  console.log(
    `\n  ${env}  ${user.email} (${user.id})\n  role: ${user.role} → ${role}   firebase: ${oldRole} → ${role}\n`,
  );

  if (!flags.confirm) {
    console.log("dry run — pass --confirm to apply");
    return;
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning({
      email: users.email,
      firebaseUid: users.firebaseUid,
      role: users.role,
    });

  if (!updatedUser || updatedUser.role !== role) {
    die("database role update did not apply");
  }

  await adminAuth.setCustomUserClaims(user.firebaseUid, {
    ...(fbUser.customClaims ?? {}),
    role,
  });

  const verifiedFirebaseUser = await adminAuth.getUser(user.firebaseUid);
  const verifiedFirebaseRole = verifiedFirebaseUser.customClaims?.role;

  if (verifiedFirebaseRole !== role) {
    die(
      `firebase role claim did not apply; expected ${role}, got ${String(
        verifiedFirebaseRole,
      )}`,
    );
  }

  await adminAuth.revokeRefreshTokens(user.firebaseUid);

  console.log(
    `done — db role=${updatedUser.role}, firebase role=${verifiedFirebaseRole}`,
  );
  console.log("existing sessions revoked — user must re-login");
}

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
