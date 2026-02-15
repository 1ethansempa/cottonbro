import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { adminAuth } from "@cottonbro/auth-server";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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
      try {
        const decodedClaims = await adminAuth.verifyIdToken(idToken, true);
        request.user = decodedClaims;
        return true;
      } catch {
        throw new UnauthorizedException("Invalid bearer token");
      }
    }

    const sessionCookie = request.cookies?.["__session"];
    if (!sessionCookie) {
      throw new UnauthorizedException("No session cookie");
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(
        sessionCookie,
        true // check if revoked
      );
      request.user = decodedClaims;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid session");
    }
  }
}
