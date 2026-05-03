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
import { adminAuth } from "@cottonbro/auth-server";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { USERS_REPOSITORY } from "./auth.service.js";
import type { UsersRepositoryPort } from "./users.repository.js";

type AuthClaims = {
  uid: string;
  email?: unknown;
};

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

      await this.assertAccountCanAccess(decodedClaims);
      request.user = decodedClaims;
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
        true // check if revoked
      );
    } catch (error) {
      throw new UnauthorizedException("Invalid session");
    }

    await this.assertAccountCanAccess(decodedClaims);
    request.user = decodedClaims;
    return true;
  }

  private async assertAccountCanAccess(claims: AuthClaims) {
    if (!this.usersRepository) return;

    const email = typeof claims.email === "string" ? claims.email : undefined;
    const user = await this.usersRepository.findByFirebaseUidOrEmail(
      claims.uid,
      email,
    );

    if (!user || user.status !== "active" || user.deletedAt) {
      throw new ForbiddenException("account_unavailable");
    }
  }
}
