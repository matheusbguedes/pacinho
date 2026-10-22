import { UserRole } from "@pacinho/shared";
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import type { JwtPayload } from "./jwt-payload";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayload }>();

    if (request.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException({ message: "Não autorizado" });
    }

    return true;
  }
}
