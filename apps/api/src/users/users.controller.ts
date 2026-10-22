import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import type { JwtPayload } from "@/auth/jwt-payload";
import { CurrentUser } from "@/common/current-user.decorator";
import { ZodValidationPipe } from "@/common/zod-validation.pipe";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  type UpdateProfileBody,
  updateProfileBodySchema,
} from "@pacinho/shared";
import type { Request } from "express";
import { memoryStorage } from "multer";

import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: JwtPayload) {
    return this.users.getMe(user.sub);
  }

  @Put("me")
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateProfileBodySchema))
    body: UpdateProfileBody,
  ) {
    return this.users.updateMe(user.sub, body);
  }

  @Post("me/media")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  addMedia(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
    @Req() request: Request,
  ) {
    const host = request.get("host");
    if (!file || !host) {
      throw new BadRequestException({ message: "Envie uma imagem" });
    }

    return this.users.addMedia(user.sub, file, `${request.protocol}://${host}`);
  }
}
