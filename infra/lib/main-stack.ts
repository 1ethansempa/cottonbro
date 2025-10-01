// CDK core library (constructs, Stack base class, utilities)
import * as cdk from "aws-cdk-lib";
// Construct base class used by all CDK resources
import { Construct } from "constructs";

// AWS service-specific CDK modules we’re using in this stack:
import * as cognito from "aws-cdk-lib/aws-cognito"; // Amazon Cognito (auth)
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"; // DynamoDB (NoSQL DB)
import * as s3 from "aws-cdk-lib/aws-s3"; // S3 (object storage)
import * as lambda from "aws-cdk-lib/aws-lambda"; // Lambda (serverless compute)
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2"; // API Gateway v2 (HTTP API)
import * as apigwv2i from "aws-cdk-lib/aws-apigatewayv2-integrations"; // API GW integrations
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager"; // Secrets Manager

// A CDK "Stack" is a deployable unit (CloudFormation stack). Everything inside gets created/updated together.
export class MainStack extends cdk.Stack {
  // The constructor defines resources that will be synthesized & deployed.
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===== Cognito user pool + domain =====
    // Create a Cognito User Pool (stores users, handles sign-in/sign-up).
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "cottonbro-users", // Friendly name for the pool
      selfSignUpEnabled: true, // Allow users to sign up themselves
      signInAliases: { email: true }, // Users sign in with email
      standardAttributes: {
        email: { required: true, mutable: false }, // Email is required and immutable
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep users if stack is deleted
    });

    // Attach a hosted UI domain to the user pool (gives you a Cognito-hosted login page).
    const domain = userPool.addDomain("HostedUiDomain", {
      cognitoDomain: { domainPrefix: "cottonbro" }, // Results in cottonbro.auth.<region>.amazoncognito.com
    });

    // ===== Google Identity Provider =====
    // Pull Google OAuth client credentials from AWS Secrets Manager (JSON with clientId & clientSecret).
    const googleSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "GoogleSecret",
      "cottonbro/google-oauth" // Secret name you created that holds Google creds
    );

    // Register Google as a social IdP for this User Pool.
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      "GoogleIdP",
      {
        userPool, // Link to our user pool
        // Google OAuth client ID: expects a string → unwrap from secret JSON.
        clientId: googleSecret
          .secretValueFromJson("clientId")
          .unsafeUnwrap()
          .toString(),
        // Google OAuth client secret: this line unwraps to a string in your code.
        // NOTE: Cognito’s CDK construct typically expects a SecretValue here;
        // you’re intentionally not changing the code—just commenting.
        clientSecret: googleSecret
          .secretValueFromJson("clientSecret")
          .unsafeUnwrap(),
        // OIDC scopes Google should grant (standard identity claims).
        scopes: ["openid", "email", "profile"],
        // Map Google profile fields into Cognito user attributes.
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      }
    );

    // ===== App clients with support for Cognito + Google =====
    // These app clients represent your frontends (web/admin) and define OAuth settings
    // like allowed callback URLs and which IdPs they support.

    // List the identity providers the clients will allow (native Cognito + Google).
    const supportedIdPs = [
      cognito.UserPoolClientIdentityProvider.COGNITO,
      cognito.UserPoolClientIdentityProvider.GOOGLE,
    ];

    // Web SPA client (for http://localhost:5173)
    const webClient = new cognito.UserPoolClient(this, "WebClient", {
      userPool, // Attach to the same user pool
      userPoolClientName: "web-spa", // Display name
      generateSecret: false, // Public client (SPA) → no client secret
      oAuth: {
        flows: { authorizationCodeGrant: true }, // Use Authorization Code + PKCE (right for SPAs)
        scopes: [
          cognito.OAuthScope.OPENID, // ID token (sub)
          cognito.OAuthScope.EMAIL, // email claim
          cognito.OAuthScope.PROFILE, // basic profile claims
        ],
        callbackUrls: ["http://localhost:5173/callback"], // Where Cognito redirects post-login
        logoutUrls: ["http://localhost:5173/"], // Where to go after logout
      },
      preventUserExistenceErrors: true, // Prevent user enumeration via error messages
      supportedIdentityProviders: supportedIdPs, // Allow login with Cognito & Google
    });
    // Ensure the Google IdP resource exists before this client references it.
    webClient.node.addDependency(googleProvider);

    // Admin SPA client (for http://localhost:5174)
    const adminClient = new cognito.UserPoolClient(this, "AdminClient", {
      userPool,
      userPoolClientName: "admin-spa",
      generateSecret: false,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ["http://localhost:5174/callback"],
        logoutUrls: ["http://localhost:5174/"],
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: supportedIdPs,
    });
    // Also wait for Google IdP before creating this client.
    adminClient.node.addDependency(googleProvider);

    // ===== Other infra pieces (Dynamo, S3, API) remain the same =====

    // DynamoDB table (single-table design: pk + sk). On-demand billing = pay per request.
    const table = new dynamodb.Table(this, "MainTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data if stack is deleted
    });

    // S3 bucket for private assets (no public access, versioning enabled).
    const assets = new s3.Bucket(this, "Assets", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true, // Force HTTPS
      versioned: true, // Keep versions of objects
    });

    // Lambda function that acts as a placeholder API handler (inline code for now).
    const apiFn = new lambda.Function(this, "ApiFn", {
      runtime: lambda.Runtime.NODEJS_20_X, // Node.js 20 runtime
      handler: "index.handler", // Entry point (exports.handler)
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => ({
          statusCode: 200,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ok: true, path: event.rawPath || "/", note: "placeholder API" })
        });
      `),
      // Environment variables exposed to the Lambda function.
      environment: {
        TABLE_NAME: table.tableName,
        USER_POOL_ID: userPool.userPoolId,
        BUCKET_NAME: assets.bucketName,
      },
    });
    // Grant the Lambda permission to read/write the DynamoDB table and S3 bucket.
    table.grantReadWriteData(apiFn);
    assets.grantReadWrite(apiFn);

    // HTTP API (API Gateway v2). We'll route all requests to the Lambda above.
    const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: "cottonbro-api",
    });
    // Catch-all route so any path (/..., /foo, /bar) hits the same Lambda for now.
    httpApi.addRoutes({
      path: "/{proxy+}",
      integration: new apigwv2i.HttpLambdaIntegration("ApiInt", apiFn),
    });

    // Outputs
    // These values print after deploy so your apps can be configured without hunting in the console.
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "WebClientId", {
      value: webClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "AdminClientId", {
      value: adminClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "HostedUiDomain", {
      // e.g., cottonbro.auth.eu-west-1.amazoncognito.com
      value: `${domain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
    new cdk.CfnOutput(this, "HttpApiUrl", { value: httpApi.apiEndpoint });
    new cdk.CfnOutput(this, "AssetsBucket", { value: assets.bucketName });
  }
}
