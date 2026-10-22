import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import type { JwtPayload } from "@/auth/jwt-payload";
import { CurrentUser } from "@/common/current-user.decorator";
import { ZodValidationPipe } from "@/common/zod-validation.pipe";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  type CreateConversationBody,
  type SendMessageBody,
  createConversationBodySchema,
  sendMessageBodySchema,
} from "@pacinho/shared";
import type { Response } from "express";

import { ConversationsService } from "./conversations.service";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    @Inject(ConversationsService)
    private readonly conversations: ConversationsService,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.conversations.list(user.sub);
  }

  @Post()
  async open(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createConversationBodySchema))
    body: CreateConversationBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.conversations.open(user.sub, body.peer_id);
    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    return result.conversation;
  }

  @Get(":id/messages")
  messages(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.conversations.messages(user.sub, id);
  }

  @Post(":id/messages")
  send(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(sendMessageBodySchema)) body: SendMessageBody,
  ) {
    return this.conversations.send(user.sub, id, body.body);
  }
}
