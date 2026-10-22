import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import type { JwtPayload } from "./jwt-payload";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = JwtPayload>(
    error: unknown,
    user: TUser | false | null,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException({ message: "Não autorizado" });
    }

    return user;
  }
}
