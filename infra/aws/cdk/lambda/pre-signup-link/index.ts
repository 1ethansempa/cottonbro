/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { PreSignUpTriggerHandler } from "aws-lambda";

const idp = new CognitoIdentityProviderClient({});

type FoundUser = {
  username: string;
  hasLocal: boolean; // true only if this is a native/local user (no `identities`)
  providers: string[]; // e.g., ["Google"] or ["COGNITO"]
  identitiesRaw?: string;
};

function classifyUser(u: any): FoundUser {
  const username = String(u?.Username ?? "");
  const identitiesRaw: string | undefined = u?.Attributes?.find(
    (a: any) => a?.Name === "identities"
  )?.Value;

  let providers: string[] = [];
  if (identitiesRaw) {
    try {
      const arr = JSON.parse(identitiesRaw) as Array<any>;
      providers = arr
        .map((i) => String(i?.providerName || "").trim())
        .filter(Boolean);
    } catch {
      // malformed identities; treat as unknown federated
      providers = [];
    }
  } else {
    // No `identities` attribute => this is a true local (COGNITO) user
    providers = ["COGNITO"];
  }

  return {
    username,
    providers,
    hasLocal: providers.includes("COGNITO"),
    identitiesRaw,
  };
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const poolId = event.userPoolId;
  const email = (event.request.userAttributes?.email ?? "")
    .trim()
    .toLowerCase();

  // ===== Native email+password sign-up: block if email exists =====
  if (event.triggerSource === "PreSignUp_SignUp") {
    if (!email) return event;
    const res = await idp.send(
      new ListUsersCommand({
        UserPoolId: poolId,
        Filter: `email = "${email}"`,
        Limit: 2,
      })
    );
    if ((res.Users ?? []).length > 0) {
      throw new Error(
        "An account with this email already exists. Please sign in instead."
      );
    }
    return event; // allow native creation
  }

  // ===== Only handle external providers after this point =====
  if (event.triggerSource !== "PreSignUp_ExternalProvider") return event;

  // Default: do not block; let Cognito proceed unless we explicitly throw
  event.response.autoConfirmUser = true;
  if (event.request.userAttributes?.email_verified === "true") {
    event.response.autoVerifyEmail = true;
  }
  if (!email) return event;

  // Detect provider name + provider user id (IdP "sub")
  let providerName = "Google";
  let providerUserId: string | undefined;

  const identitiesJson = event.request.userAttributes?.identities;
  if (identitiesJson) {
    try {
      const identities = JSON.parse(identitiesJson) as Array<any>;
      const primary = identities?.find((i) => i?.primary) ?? identities?.[0];
      if (primary?.providerName && primary?.userId) {
        providerName = String(primary.providerName);
        providerUserId = String(primary.userId);
      }
    } catch {
      /* ignore; fallback below */
    }
  }
  // Fallback: userName like "<Provider>_<sub>"
  if (!providerUserId && typeof event.userName === "string") {
    const [maybe, ...rest] = event.userName.split("_");
    if (rest.length) {
      providerName = maybe;
      providerUserId = rest.join("_");
    }
  }
  if (!providerUserId) {
    // Can't link without a provider subject; allow creation as new federated user
    return event;
  }

  // Lookup existing users by email
  const res = await idp.send(
    new ListUsersCommand({
      UserPoolId: poolId,
      Filter: `email = "${email}"`,
      Limit: 5,
    })
  );
  const matches = (res.Users ?? []).map(classifyUser);

  if (matches.length === 0) {
    // No existing user → allow Cognito to create a new federated user
    return event;
  }

  // Prefer an existing LOCAL user as the merge target
  const local = matches.find((u) => u.hasLocal);
  if (local) {
    try {
      await idp.send(
        new AdminLinkProviderForUserCommand({
          UserPoolId: poolId,
          DestinationUser: {
            // Local (COGNITO) user goes in Destination
            ProviderName: "Cognito",
            ProviderAttributeName: "Cognito_Sub", // correct for destination/local
            ProviderAttributeValue: local.username,
          },
          SourceUser: {
            // Social IdP goes in Source
            ProviderName: providerName, // e.g., "Google"
            ProviderAttributeName: "Cognito_Subject", // correct for social source
            ProviderAttributeValue: providerUserId!,
          },
        })
      );
      console.log(
        `Linked ${providerName}(${providerUserId}) -> ${local.username}`
      );
      return event;
    } catch (err: any) {
      const code = String(err?.name || "");
      const msg = String(err?.message || err);
      // If already linked (common during retries), allow the flow
      if (/ResourceConflictException/i.test(code)) {
        console.log("AdminLink: already linked; proceeding.");
        return event;
      }
      console.error(
        "AdminLink failed; blocking to avoid duplicate:",
        code,
        msg
      );
      throw new Error(
        "Account with this email already exists. Please sign in with your existing method first."
      );
    }
  }

  // No local user, but at least one federated user exists with this email.
  // Cognito cannot link external -> external; block to prevent duplicates.
  const federatedProviders = Array.from(
    new Set(matches.flatMap((u) => u.providers).filter((p) => p !== "COGNITO"))
  );
  console.warn(
    `Email already in use by federated account(s): ${federatedProviders.join(",")}`
  );
  throw new Error(
    "An account with this email already exists via a social login. Please sign in using that method."
  );
};
