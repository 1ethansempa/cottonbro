// infra/aws/cdk/lib/cottonbro-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** helpers */
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

    const existingUserPoolId = normalizeId(
      this.node.tryGetContext("existingUserPoolId")
    );
    const existingUserPoolClientId = normalizeId(
      this.node.tryGetContext("existingUserPoolClientId")
    );
    const existingHostedUiBaseUrl = normalizeId(
      this.node.tryGetContext("existingHostedUiBaseUrl")
    );

    console.error("CDK_CTX =>", {
      domainPrefix,
      webCallbacks,
      webLogouts,
      existingUserPoolId,
      existingUserPoolClientId,
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
          standardAttributes: { email: { required: true, mutable: true } },
          autoVerify: { email: true },
          // removalPolicy: cdk.RemovalPolicy.RETAIN,
        }));

    /** Hosted UI domain (only when creating a new pool here) */
    let hostedUiBaseUrl: string | undefined = existingHostedUiBaseUrl;
    if (!existingUserPoolId && userPoolL2) {
      const domain = userPoolL2.addDomain("HostedUiDomain", {
        cognitoDomain: { domainPrefix }, // must be unique per region
      });
      hostedUiBaseUrl = domain.baseUrl();
    }

    // ===== Google OAuth secret (usable for created or imported pool) =====
    let googleClientId: string | undefined;
    let googleClientSecret: string | undefined;
    try {
      const secret = secretsmanager.Secret.fromSecretNameV2(
        this,
        "GoogleSecret",
        "cottonbro/google-oauth" // JSON: { "clientId": "...", "clientSecret": "..." }
      );
      googleClientId = secret.secretValueFromJson("clientId").unsafeUnwrap();
      // toString() works whether it's lazy or plain
      googleClientSecret =
        secret.secretValueFromJson("clientSecret").unsafeUnwrap?.() ??
        secret.secretValueFromJson("clientSecret").toString();
    } catch {
      // Secret missing or not accessible; proceed without Google
    }
    const googleConfigured = Boolean(googleClientId && googleClientSecret);

    // ===== Ensure/Update Google IdP (idempotent, created OR imported pool) =====
    if (googleConfigured) {
      new AwsCustomResource(this, "EnsureGoogleIdP", {
        onCreate: {
          service: "CognitoIdentityServiceProvider",
          action: "createIdentityProvider",
          parameters: {
            UserPoolId: userPool.userPoolId,
            ProviderName: "Google",
            ProviderType: "Google",
            ProviderDetails: {
              client_id: googleClientId!,
              client_secret: googleClientSecret!,
              authorize_scopes: "openid profile email",
            },
            AttributeMapping: {
              email: "email",
              given_name: "given_name",
              family_name: "family_name",
              name: "name",
              // picture: "picture",
            },
          },
          physicalResourceId: PhysicalResourceId.of("google-idp"),
          // tolerate "already exists" so update can run
          ignoreErrorCodesMatching: ".*DuplicateProvider.*|.*already exists.*",
        },
        onUpdate: {
          service: "CognitoIdentityServiceProvider",
          action: "updateIdentityProvider",
          parameters: {
            UserPoolId: userPool.userPoolId,
            ProviderName: "Google",
            ProviderDetails: {
              client_id: googleClientId!,
              client_secret: googleClientSecret!,
              authorize_scopes: "openid profile email",
            },
            AttributeMapping: {
              email: "email",
              given_name: "given_name",
              family_name: "family_name",
              name: "name",
            },
          },
          physicalResourceId: PhysicalResourceId.of("google-idp"),
        },
        policy: AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: [
              "cognito-idp:CreateIdentityProvider",
              "cognito-idp:UpdateIdentityProvider",
              "cognito-idp:DescribeIdentityProvider",
            ],
            resources: ["*"],
          }),
        ]),
        installLatestAwsSdk: false,
      });
    }

    // ===== PreSignUp trigger function =====
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

    // Logs
    preSignUpFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // Cognito admin permissions needed by the handler
    preSignUpFn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"], // most Admin* are not resource-scoped
        actions: [
          "cognito-idp:ListUsers",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminLinkProviderForUser",
          "cognito-idp:DescribeUserPool",
        ],
      })
    );

    // Pool ARN (works for created OR imported)
    const poolArn =
      userPoolL2?.userPoolArn ??
      cdk.Stack.of(this).formatArn({
        service: "cognito-idp",
        resource: "userpool",
        resourceName: existingUserPoolId!, // defined in import mode
      });

    // Allow Cognito to invoke the Lambda
    preSignUpFn.addPermission("InvokeByCognito", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: poolArn,
    });

    // Attach PreSignUp trigger (L2 when created; custom resource when imported)
    if (userPoolL2) {
      userPoolL2.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUpFn);
    } else if (existingUserPoolId) {
      const attachPreSignUp = new AwsCustomResource(
        this,
        "AttachPreSignUpTrigger",
        {
          onCreate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPool",
            parameters: {
              UserPoolId: existingUserPoolId,
              LambdaConfig: { PreSignUp: preSignUpFn.functionArn },
            },
            physicalResourceId: PhysicalResourceId.of(
              `attach-presignup-${existingUserPoolId}`
            ),
          },
          onUpdate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPool",
            parameters: {
              UserPoolId: existingUserPoolId,
              LambdaConfig: { PreSignUp: preSignUpFn.functionArn },
            },
            physicalResourceId: PhysicalResourceId.of(
              `attach-presignup-${existingUserPoolId}`
            ),
          },
          policy: AwsCustomResourcePolicy.fromStatements([
            new iam.PolicyStatement({
              actions: [
                "cognito-idp:UpdateUserPool",
                "cognito-idp:DescribeUserPool",
              ],
              resources: ["*"],
            }),
          ]),
          installLatestAwsSdk: false,
        }
      );
      attachPreSignUp.node.addDependency(preSignUpFn);
    }

    // ===== App client (create OR import) =====
    let webClientIdOutput: string;

    // helper: enforce explicit auth flows + Hosted UI settings on a client
    const makeClientEnforcers = (
      clientId: string,
      label: "Created" | "Imported"
    ) => {
      const enforceFlows = new AwsCustomResource(
        this,
        `EnforceExplicitAuthFlows_${label}`,
        {
          onCreate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPoolClient",
            parameters: {
              UserPoolId: userPool.userPoolId,
              ClientId: clientId,
              ExplicitAuthFlows: [
                "ALLOW_USER_PASSWORD_AUTH",
                "ALLOW_USER_SRP_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH",
              ],
            },
            physicalResourceId: PhysicalResourceId.of(
              `enforce-auth-flows-${clientId}`
            ),
          },
          onUpdate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPoolClient",
            parameters: {
              UserPoolId: userPool.userPoolId,
              ClientId: clientId,
              ExplicitAuthFlows: [
                "ALLOW_USER_PASSWORD_AUTH",
                "ALLOW_USER_SRP_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH",
              ],
            },
            physicalResourceId: PhysicalResourceId.of(
              `enforce-auth-flows-${clientId}`
            ),
          },
          policy: AwsCustomResourcePolicy.fromStatements([
            new iam.PolicyStatement({
              actions: [
                "cognito-idp:UpdateUserPoolClient",
                "cognito-idp:DescribeUserPoolClient",
              ],
              resources: ["*"],
            }),
          ]),
          installLatestAwsSdk: false,
        }
      );

      const supportedIdPs = googleConfigured
        ? ["COGNITO", "Google"]
        : ["COGNITO"];

      const enforceHostedUi = new AwsCustomResource(
        this,
        `EnforceHostedUi_${label}`,
        {
          onCreate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPoolClient",
            parameters: {
              UserPoolId: userPool.userPoolId,
              ClientId: clientId,
              CallbackURLs: webCallbacks,
              LogoutURLs: webLogouts,
              SupportedIdentityProviders: supportedIdPs,
              AllowedOAuthFlows: ["code"],
              AllowedOAuthScopes: ["openid", "email", "profile"],
              AllowedOAuthFlowsUserPoolClient: true,
              PreventUserExistenceErrors: "ENABLED",
            },
            physicalResourceId: PhysicalResourceId.of(
              `enforce-hosted-ui-${clientId}`
            ),
          },
          onUpdate: {
            service: "CognitoIdentityServiceProvider",
            action: "updateUserPoolClient",
            parameters: {
              UserPoolId: userPool.userPoolId,
              ClientId: clientId,
              CallbackURLs: webCallbacks,
              LogoutURLs: webLogouts,
              SupportedIdentityProviders: supportedIdPs,
              AllowedOAuthFlows: ["code"],
              AllowedOAuthScopes: ["openid", "email", "profile"],
              AllowedOAuthFlowsUserPoolClient: true,
              PreventUserExistenceErrors: "ENABLED",
            },
            physicalResourceId: PhysicalResourceId.of(
              `enforce-hosted-ui-${clientId}`
            ),
          },
          policy: AwsCustomResourcePolicy.fromStatements([
            new iam.PolicyStatement({
              actions: [
                "cognito-idp:UpdateUserPoolClient",
                "cognito-idp:DescribeUserPoolClient",
              ],
              resources: ["*"],
            }),
          ]),
          installLatestAwsSdk: false,
        }
      );

      return { enforceFlows, enforceHostedUi };
    };

    if (existingUserPoolClientId) {
      // Import existing client; enforce flows + hosted UI every deploy
      cognito.UserPoolClient.fromUserPoolClientId(
        this,
        "WebClientImported",
        existingUserPoolClientId
      );
      makeClientEnforcers(existingUserPoolClientId, "Imported");
      webClientIdOutput = existingUserPoolClientId;
      new cdk.CfnOutput(this, "WebClientId", { value: webClientIdOutput });
    } else {
      // Create new client in the (created or imported) pool
      const supportedIdPsForCreate: cognito.UserPoolClientIdentityProvider[] =
        googleConfigured
          ? [
              cognito.UserPoolClientIdentityProvider.COGNITO,
              cognito.UserPoolClientIdentityProvider.GOOGLE,
            ]
          : [cognito.UserPoolClientIdentityProvider.COGNITO];

      const webClient = new cognito.UserPoolClient(this, "WebClient", {
        userPool,
        userPoolClientName: "web-spa",
        generateSecret: false, // public SPA (PKCE)
        authFlows: { userPassword: true, userSrp: true },
        accessTokenValidity: cdk.Duration.hours(1),
        idTokenValidity: cdk.Duration.hours(1),
        refreshTokenValidity: cdk.Duration.days(30),
        oAuth: {
          flows: { authorizationCodeGrant: true },
          scopes: [
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: webCallbacks,
          logoutUrls: webLogouts,
        },
        preventUserExistenceErrors: true,
        supportedIdentityProviders: supportedIdPsForCreate,
      });

      const { enforceFlows, enforceHostedUi } = makeClientEnforcers(
        webClient.userPoolClientId,
        "Created"
      );
      enforceFlows.node.addDependency(webClient);
      enforceHostedUi.node.addDependency(webClient);

      webClientIdOutput = webClient.userPoolClientId;
      new cdk.CfnOutput(this, "WebClientId", { value: webClientIdOutput });
    }

    // ===== Outputs =====
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });

    if (hostedUiBaseUrl) {
      new cdk.CfnOutput(this, "HostedUiDomainBaseUrl", {
        value: hostedUiBaseUrl,
      });
    }

    const issuer = `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`;
    new cdk.CfnOutput(this, "Issuer", { value: issuer });
    new cdk.CfnOutput(this, "JwksUrl", {
      value: `${issuer}/.well-known/jwks.json`,
    });
  }
}
