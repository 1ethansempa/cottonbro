/* eslint-disable @typescript-eslint/no-explicit-any */
// lambda/pre-signup-link.ts
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
  AdminUpdateUserAttributesCommand, // ← ADDED
} from "@aws-sdk/client-cognito-identity-provider";
import type {
  PreSignUpTriggerHandler,
  PreSignUpTriggerEvent,
} from "aws-lambda";

const cognito = new CognitoIdentityProviderClient({});

export const handler: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent
) => {
  // Only run for federated providers (Google/Apple/etc.)
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event;
  }

  const userPoolId = event.userPoolId;
  const email = (event.request.userAttributes?.email || "").toLowerCase();

  if (!email) {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    return event;
  }

  let providerName = "Google";
  let providerUserId: string | undefined;

  try {
    // Parse Cognito identities JSON if present
    const identitiesJson = event.request.userAttributes?.identities;
    if (identitiesJson) {
      const identities = JSON.parse(identitiesJson);
      const primary =
        identities?.find((i: any) => i?.primary) ?? identities?.[0];
      if (primary?.providerName && primary?.userId) {
        providerName = primary.providerName;
        providerUserId = primary.userId;
      }
    }

    // Fallback parse from userName: "Google_xxx"
    if (!providerUserId && typeof event.userName === "string") {
      const [maybeProvider, ...rest] = event.userName.split("_");
      if (rest.length) {
        providerName = maybeProvider;
        providerUserId = rest.join("_");
      }
    }

    // If we found an IdP userId, try linking
    if (providerUserId) {
      const listResp = await cognito.send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          Filter: `email = "${email}"`,
          Limit: 1,
        })
      );

      const existing = listResp.Users?.[0];

      if (existing?.Username) {
        try {
          // 👉 Link federated account to the existing Cognito user
          await cognito.send(
            new AdminLinkProviderForUserCommand({
              UserPoolId: userPoolId,
              DestinationUser: {
                ProviderName: "Cognito",
                ProviderAttributeValue: existing.Username,
              },
              SourceUser: {
                ProviderName: providerName,
                ProviderAttributeName: "Cognito_Subject", // required for social providers
                ProviderAttributeValue: providerUserId,
              },
            })
          );

          // 👉 Immediately mark email as verified on the existing user
          await cognito.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: userPoolId,
              Username: existing.Username,
              UserAttributes: [{ Name: "email_verified", Value: "true" }],
            })
          );

          console.log(
            `Linked ${providerName} user ${providerUserId} → Cognito user ${existing.Username} (email_verified=true)`
          );
        } catch (linkErr) {
          console.error("Link/verify step failed:", linkErr);
        }
      }
    }
  } catch (outerErr) {
    console.error("PreSignUp linking error:", outerErr);
  }

  // ✅ Always auto-confirm and verify email to avoid blocking signup
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
