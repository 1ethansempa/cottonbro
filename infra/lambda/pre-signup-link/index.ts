/* eslint-disable @typescript-eslint/no-explicit-any */
// lambda/pre-signup-link.ts
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type {
  PreSignUpTriggerHandler,
  PreSignUpTriggerEvent,
} from "aws-lambda";

const cognito = new CognitoIdentityProviderClient({});

export const handler: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent
) => {
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event; // native signup: do nothing
  }

  // Be permissive by default (don’t block signup)
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  const userPoolId = event.userPoolId;
  const email = (event.request.userAttributes?.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) return event;

  let providerName = "Google";
  let providerUserId: string | undefined;

  try {
    // Prefer identities array
    const identitiesJson = event.request.userAttributes?.identities;
    let identities: any[] | undefined;
    try {
      identities = identitiesJson ? JSON.parse(identitiesJson) : undefined;
    } catch {
      identities = undefined;
    }

    const primary = identities?.find((i) => i?.primary) ?? identities?.[0];
    if (primary?.providerName && primary?.userId) {
      providerName = primary.providerName;
      providerUserId = primary.userId;
    }

    // Fallback: "Google_123..."
    if (!providerUserId && typeof event.userName === "string") {
      const [maybeProvider, ...rest] = event.userName.split("_");
      if (rest.length) {
        providerName = maybeProvider;
        providerUserId = rest.join("_");
      }
    }

    if (!providerUserId) return event;

    // Find existing local user by email
    const listResp = await cognito.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      })
    );

    const existing = listResp.Users?.[0];
    if (!existing?.Username) return event;

    // Force inbound email to match stored (avoid immutable update errors)
    const existingEmail = existing.Attributes?.find(
      (a) => a.Name === "email"
    )?.Value;
    if (existingEmail) {
      event.request.userAttributes.email = existingEmail;
    }

    try {
      // Link federated identity → existing Cognito user
      await cognito.send(
        new AdminLinkProviderForUserCommand({
          UserPoolId: userPoolId,
          DestinationUser: {
            ProviderName: "Cognito",
            ProviderAttributeValue: existing.Username,
          },
          SourceUser: {
            ProviderName: providerName,
            ProviderAttributeName: "Cognito_Subject",
            ProviderAttributeValue: providerUserId,
          },
        })
      );

      // Ensure local user is marked verified
      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: existing.Username,
          UserAttributes: [{ Name: "email_verified", Value: "true" }],
        })
      );

      console.log(
        `Linked ${providerName}(${providerUserId}) -> ${existing.Username}; email_verified=true`
      );
    } catch (linkErr) {
      console.error("Link/verify step failed:", linkErr);
    }
  } catch (outerErr) {
    console.error("PreSignUp linking error:", outerErr);
  }

  return event;
};
