// lib/main-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2i from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========= User pool (NEW logical resource to avoid immutable conflicts) =========
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "cottonbro-users",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      removalPolicy: cdk.RemovalPolicy.RETAIN, // keep users if stack deleted
    });

    // ========= Hosted UI domain =========
    // in your stack
    const domain = userPool.addDomain("HostedUiDomain", {
      cognitoDomain: { domainPrefix: "cottonbro" }, // <- NEW, unique
    });

    // ========= Google IdP =========
    // Secret JSON: { "clientId": "...", "clientSecret": "..." }
    const googleSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "GoogleSecret",
      "cottonbro/google-oauth"
    );

    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      "GoogleIdP",
      {
        userPool,
        clientId: googleSecret
          .secretValueFromJson("clientId")
          .unsafeUnwrap()
          .toString(),
        clientSecret: googleSecret
          .secretValueFromJson("clientSecret")
          .unsafeUnwrap(),
        scopes: ["openid", "email", "profile"],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      }
    );

    const supportedIdPs = [
      cognito.UserPoolClientIdentityProvider.COGNITO,
      cognito.UserPoolClientIdentityProvider.GOOGLE,
    ];
    const oauthScopes = [
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.PROFILE,
    ];

    // ========= PreSignUp trigger (link social → existing local user) =========
    const preSignUpFn = new NodejsFunction(this, "PreSignUpLinkFn", {
      entry: "lambda/pre-signup-link/index.ts",
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      bundling: { target: "node20" },
      description:
        "PreSignUp trigger to link social identities to existing local users",
    });

    // Allow lookup, linking, and email_verified update (no direct pool ARN to avoid cycles)
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

    // Attach trigger
    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUpFn);

    // ========= App clients =========
    const webClient = new cognito.UserPoolClient(this, "WebClient", {
      userPool,
      userPoolClientName: "web-spa",
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: oauthScopes,
        callbackUrls: ["http://localhost:5173/auth/callback"],
        logoutUrls: ["http://localhost:5173/"],
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: supportedIdPs,
    });
    webClient.node.addDependency(googleProvider);

    const adminClient = new cognito.UserPoolClient(this, "AdminClient", {
      userPool,
      userPoolClientName: "admin-spa",
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: oauthScopes,
        callbackUrls: ["http://localhost:5174/auth/callback"],
        logoutUrls: ["http://localhost:5174/"],
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: supportedIdPs,
    });
    adminClient.node.addDependency(googleProvider);

    // ========= Data plane (unchanged) =========
    const table = new dynamodb.Table(this, "MainTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const assets = new s3.Bucket(this, "Assets", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
    });

    const apiFn = new lambda.Function(this, "ApiFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => ({
          statusCode: 200,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ok: true, path: event.rawPath || "/", note: "placeholder API" })
        });
      `),
      environment: {
        TABLE_NAME: table.tableName,
        USER_POOL_ID: userPool.userPoolId,
        BUCKET_NAME: assets.bucketName,
      },
    });
    table.grantReadWriteData(apiFn);
    assets.grantReadWrite(apiFn);

    const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: "cottonbro-api",
    });

    httpApi.addRoutes({
      path: "/{proxy+}",
      integration: new apigwv2i.HttpLambdaIntegration("ApiInt", apiFn),
    });

    // ========= Outputs =========
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "WebClientId", {
      value: webClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "AdminClientId", {
      value: adminClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "HostedUiDomainBaseUrl", {
      value: domain.baseUrl(),
    });
    new cdk.CfnOutput(this, "HttpApiUrl", { value: httpApi.apiEndpoint });
    new cdk.CfnOutput(this, "AssetsBucket", { value: assets.bucketName });
  }
}
