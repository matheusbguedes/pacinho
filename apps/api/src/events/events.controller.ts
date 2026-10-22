import { AdminGuard } from "@/auth/admin.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import type { JwtPayload } from "@/auth/jwt-payload";
import { CurrentUser } from "@/common/current-user.decorator";
import { ZodValidationPipe } from "@/common/zod-validation.pipe";
import {
  Body,
  Controller,
  Delete,
  Inject,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  type CreateEventBody,
  type ListEventsParams,
  createEventBodySchema,
  listEventsQuerySchema,
} from "@pacinho/shared";

import { EventsService } from "./events.service";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(@Inject(EventsService) private readonly events: EventsService) {}

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listEventsQuerySchema))
    query: ListEventsParams,
  ) {
    return this.events.list(user.sub, query);
  }

  @Get(":id")
  getById(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.events.getById(user.sub, id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body(new ZodValidationPipe(createEventBodySchema)) body: CreateEventBody,
  ) {
    return this.events.create(body);
  }

  @Post(":id/attend")
  @HttpCode(HttpStatus.OK)
  attend(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.events.attend(user.sub, id);
  }

  @Delete(":id/attend")
  unattend(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.events.unattend(user.sub, id);
  }
}
