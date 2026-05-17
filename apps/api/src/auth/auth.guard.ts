import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  Optional,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { adminAuth } from "@cottonplug/auth-server";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { USERS_REPOSITORY } from "./auth.service.js";
import type { UsersRepositoryPort } from "./users.repository.js";

const BEARER_TOKEN_MAX_AGE_SECONDS = 20 * 60;
const TOKEN_CLOCK_SKEW_SECONDS = 60;

type AuthClaims = {
  uid: string;
  email?: unknown;
  iat?: unknown;
  role?: unknown;
};
// At a high level, it accepts two kinds of auth:
// 1. Firebase Bearer token in Authorization header
// 2. Firebase session cookie named __session

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository?: UsersRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers?.authorization ?? request.headers?.Authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.slice("Bearer ".length).trim();
      if (!idToken) {
        throw new UnauthorizedException("Missing bearer token");
      }
      let decodedClaims: AuthClaims;
      try {
        decodedClaims = await adminAuth.verifyIdToken(idToken, true);
      } catch {
        throw new UnauthorizedException("Invalid bearer token");
      }

      this.assertFreshBearerToken(decodedClaims);
      const user = await this.assertAccountCanAccess(decodedClaims);
      request.user = { ...decodedClaims, role: user?.role };
      return true;
    }

    const sessionCookie = request.cookies?.["__session"];
    if (!sessionCookie) {
      throw new UnauthorizedException("No session cookie");
    }

    let decodedClaims: AuthClaims;
    try {
      decodedClaims = await adminAuth.verifySessionCookie(
        sessionCookie,
        true, // check if revoked
      );
    } catch (error) {
      throw new UnauthorizedException("Invalid session");
    }

    const user = await this.assertAccountCanAccess(decodedClaims);
    request.user = { ...decodedClaims, role: user?.role };
    return true;
  }

  private async assertAccountCanAccess(claims: AuthClaims) {
    if (!this.usersRepository) return undefined;

    const email = typeof claims.email === "string" ? claims.email : undefined;
    const user = await this.usersRepository.findByFirebaseUidOrEmail(
      claims.uid,
      email,
    );

    if (
      !user ||
      user.status !== "active" ||
      user.deletedAt ||
      !user.privacyPolicyAcceptedAt ||
      !user.termsAcceptedAt
    ) {
      throw new ForbiddenException("account_unavailable");
    }

    return user;
  }

  private assertFreshBearerToken(claims: AuthClaims) {
    if (typeof claims.iat !== "number") {
      throw new UnauthorizedException("Invalid bearer token");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenAgeSeconds = nowSeconds - claims.iat;

    if (
      tokenAgeSeconds > BEARER_TOKEN_MAX_AGE_SECONDS ||
      tokenAgeSeconds < -TOKEN_CLOCK_SKEW_SECONDS
    ) {
      throw new UnauthorizedException("Bearer token expired");
    }
  }
}
