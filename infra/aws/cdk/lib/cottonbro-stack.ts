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
  if (Array.isArray(v))
    return v
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (v == null) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function normalizeId(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return s && s.toLowerCase() !== "null" && s.toLowerCase() !== "undefined"
    ? s
    : undefined;
}

export class CottonbroStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===== Context =====
    const domainPrefix = (this.node.tryGetContext("domainPrefix") ??
      "cottonbro") as string;

    const webCallbacks = asArray(
      this.node.tryGetContext("webCallback") ??
        "http://localhost:5173/api/auth/callback/cognito"
    );
    const webLogouts = asArray(
      this.node.tryGetContext("webLogout") ?? "http://localhost:5173/"
    );

    // If set => import; if not set => create
    const existingUserPoolId = normalizeId(
      this.node.tryGetContext("existingUserPoolId")
    );
    const existingHostedUiBaseUrl = normalizeId(
      this.node.tryGetContext("existingHostedUiBaseUrl")
    );

    // Log to STDERR so it shows even when stdout is redirected
    console.error("CDK_CTX =>", {
      domainPrefix,
      webCallbacks,
      webLogouts,
      existingUserPoolId,
    });

    // ===== User Pool: import OR create =====
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
            // allow updates to avoid “Attribute cannot be updated” during social link without PreSignUp
            email: { required: true, mutable: true },
          },
          autoVerify: { email: true },
          // removalPolicy: cdk.RemovalPolicy.RETAIN, // uncomment if you prefer retain on delete
        }));

    // ===== Hosted UI Domain (ONLY when creating a new pool here) =====
    let hostedUiBaseUrl: string | undefined = existingHostedUiBaseUrl;
    if (!existingUserPoolId && userPoolL2) {
      const domain = userPoolL2.addDomain("HostedUiDomain", {
        cognitoDomain: { domainPrefix }, // must be unique per region
      });
      hostedUiBaseUrl = domain.baseUrl();
    }

    // ===== Optional Google IdP (ONLY when creating a new pool here) =====
    let googleIdp: cognito.UserPoolIdentityProviderGoogle | undefined;
    if (!existingUserPoolId && userPoolL2) {
      try {
        // Secret name in Secrets Manager:
        //   cottonbro/google-oauth  with JSON: { "clientId": "...", "clientSecret": "..." }
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
        // Secret missing or not accessible; skip IdP
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

    // ===== PreSignUp trigger (ONLY when creating a new pool here) =====
    // Compute the pool ARN for IAM scoping (works for both created or imported pool)
    const poolArn = userPoolL2
      ? userPoolL2.userPoolArn
      : cdk.Stack.of(this).formatArn({
          service: "cognito-idp",
          resource: "userpool",
          resourceName: existingUserPoolId!, // assert it's defined in import mode
        });

    // Create the function UNCONDITIONALLY (so you can update policy later too)
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
      bundling: { target: "node20", format: OutputFormat.ESM, minify: true },
      description:
        "PreSignUp trigger to link social identities to existing local users",
    });

    // Always ensure logging (usually added by default, harmless if present)
    preSignUpFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // Attach the required Cognito admin permissions, scoped to your pool
    preSignUpFn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [poolArn],
        actions: [
          "cognito-idp:ListUsers",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminLinkProviderForUser",
          "cognito-idp:DescribeUserPool",
        ],
      })
    );

    // Attach the PreSignUp trigger ONLY if we CREATED the pool in this stack.
    // (Cognito doesn't let CDK attach triggers to an imported pool.)
    if (userPoolL2) {
      userPoolL2.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUpFn);
    } else {
      // For imported pools, output the function ARN and pool ID so you can wire once via CLI:
      new cdk.CfnOutput(this, "PreSignUpFnArn", {
        value: preSignUpFn.functionArn,
      });
      new cdk.CfnOutput(this, "ImportedPoolId", { value: existingUserPoolId! });
      // After deploy (one-time):
      // aws cognito-idp update-user-pool \
      //   --region eu-west-1 \
      //   --user-pool-id <ImportedPoolId> \
      //   --lambda-config PreSignUp=<PreSignUpFnArn>
    }

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
