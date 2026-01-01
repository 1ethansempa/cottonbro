import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { adminAuth } from "@cottonbro/auth-server";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
