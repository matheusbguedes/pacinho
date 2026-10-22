import { ZodValidationPipe } from "@/common/zod-validation.pipe";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from "@nestjs/common";
import {
  type SocialSignInBody,
  socialSignInBodySchema,
} from "@pacinho/shared";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("social")
  @HttpCode(HttpStatus.OK)
  signInSocial(
    @Body(new ZodValidationPipe(socialSignInBodySchema))
    body: SocialSignInBody,
  ) {
    return this.auth.signInWithIdentity(body);
  }

  @Post("dev")
  @HttpCode(HttpStatus.OK)
  signInDevelopment() {
    return this.auth.signInDevelopment();
  }
}
