import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ESM-friendly __dirname/__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function asArray(v: unknown): string[] {
  if (!v) return [];
  return Array.isArray(v)
    ? (v as string[])
    : String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export class CottonbroStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===== Context =====
    const domainPrefix = this.node.tryGetContext("domainPrefix") ?? "cottonbro";
    const webCallbacks = asArray(
      this.node.tryGetContext("webCallback") ?? [
        "http://localhost:5173/api/auth/callback/cognito",
      ]
    );
    const webLogouts = asArray(
      this.node.tryGetContext("webLogout") ?? ["http://localhost:5173/"]
    );

    const existingUserPoolId: string | undefined =
      this.node.tryGetContext("existingUserPoolId");

    // Optional: only for pretty output when importing an existing pool
    const existingHostedUiBaseUrl: string | undefined = this.node.tryGetContext(
      "existingHostedUiBaseUrl"
    );

    // Explicit switch: refuse accidental creation
    const allowCreate = this.node.tryGetContext("allowCreate") === "true";
    if (!existingUserPoolId && !allowCreate) {
      throw new Error(
        "Refusing to create a new Cognito User Pool. " +
          "Pass -c existingUserPoolId=<POOL_ID> to import an existing pool, " +
          "or -c allowCreate=true to explicitly create a new one."
      );
    }

    // ===== User Pool: import OR create (only if allowCreate) =====
    let userPoolL2: cognito.UserPool | undefined;
    const userPool: cognito.IUserPool = existingUserPoolId
      ? cognito.UserPool.fromUserPoolId(
          this,
          "UserPoolImported",
          existingUserPoolId
        )
      : (userPoolL2 = new cognito.UserPool(this, "UserPool", {
          userPoolName: "cottonbro-users",
          selfSignUpEnabled: true,
          signInAliases: { email: true },
          standardAttributes: {
            email: { required: true, mutable: false },
          },
          removalPolicy: cdk.RemovalPolicy.RETAIN,
        }));

    // ===== Hosted UI Domain (ONLY when creating a new pool) =====
    let hostedUiBaseUrl: string | undefined = existingHostedUiBaseUrl;
    if (!existingUserPoolId && allowCreate && userPoolL2) {
      const domain = userPoolL2.addDomain("HostedUiDomain", {
        cognitoDomain: { domainPrefix }, // must be unique
      });
      hostedUiBaseUrl = domain.baseUrl();
    }

    // ===== Optional Google IdP (ONLY when creating a new pool) =====
    let googleIdp: cognito.UserPoolIdentityProviderGoogle | undefined;
    if (!existingUserPoolId && allowCreate && userPoolL2) {
      try {
        // Secret name: cottonbro/google-oauth
        // JSON: { "clientId": "...", "clientSecret": "..." }
        const secret = secretsmanager.Secret.fromSecretNameV2(
          this,
          "GoogleSecret",
          "cottonbro/google-oauth"
        );

        googleIdp = new cognito.UserPoolIdentityProviderGoogle(
          this,
          "GoogleIdP",
          {
            userPool: userPoolL2,
            clientId: secret.secretValueFromJson("clientId").unsafeUnwrap(),
            // clientSecret is deprecated; use clientSecretValue
            clientSecretValue: secret.secretValueFromJson("clientSecret"),
            scopes: ["openid", "email", "profile"],
            attributeMapping: {
              email: cognito.ProviderAttribute.GOOGLE_EMAIL,
              givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
              familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
            },
          }
        );
      } catch {
        // Secret missing or not accessible; skip Google IdP
      }
    }

    const supportedIdPs = [
      cognito.UserPoolClientIdentityProvider.COGNITO,
      ...(googleIdp ? [cognito.UserPoolClientIdentityProvider.GOOGLE] : []),
    ];

    const oauthScopes = [
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.PROFILE,
    ];

    // ===== PreSignUp trigger (ONLY when creating a new pool) =====
    if (!existingUserPoolId && allowCreate && userPoolL2) {
      const preSignUpFn = new NodejsFunction(this, "PreSignUpLinkFn", {
        entry: path.join(
          __dirname,
          "..",
          "lambda",
          "pre-signup-link",
          "index.ts"
        ),
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 256,
        timeout: cdk.Duration.seconds(10),
        bundling: {
          target: "node20",
          format: OutputFormat.ESM,
          minify: true,
        },
        description:
          "PreSignUp trigger to link social identities to existing local users",
      });

      preSignUpFn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: [
            "cognito-idp:ListUsers",
            "cognito-idp:AdminLinkProviderForUser",
            "cognito-idp:AdminUpdateUserAttributes",
          ],
          resources: ["*"],
        })
      );

      userPoolL2.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUpFn);
    }
    // If you imported a pool and still want a PreSignUp trigger,
    // set it once via CLI:
    // aws cognito-idp update-user-pool --user-pool-id <POOL_ID> --lambda-config PreSignUp=<LAMBDA_ARN>

    // ===== App client (works for imported OR new pool) =====
    const webClient = new cognito.UserPoolClient(this, "WebClient", {
      userPool,
      userPoolClientName: "web-spa",
      generateSecret: false, // public client (PKCE)
      authFlows: { userPassword: true, userSrp: true },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: oauthScopes,
        callbackUrls: webCallbacks,
        logoutUrls: webLogouts,
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: supportedIdPs,
    });
    if (googleIdp) webClient.node.addDependency(googleIdp);

    // ===== Outputs =====
    const issuer = `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`;
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "WebClientId", {
      value: webClient.userPoolClientId,
    });
    if (hostedUiBaseUrl) {
      new cdk.CfnOutput(this, "HostedUiDomainBaseUrl", {
        value: hostedUiBaseUrl,
      });
    }
    new cdk.CfnOutput(this, "Issuer", { value: issuer });
    new cdk.CfnOutput(this, "JwksUrl", {
      value: `${issuer}/.well-known/jwks.json`,
    });
  }
}
