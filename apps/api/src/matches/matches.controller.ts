import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import type { JwtPayload } from "@/auth/jwt-payload";
import { CurrentUser } from "@/common/current-user.decorator";
import { ZodValidationPipe } from "@/common/zod-validation.pipe";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  type ListPeopleParams,
  type MatchActionBody,
  listPeopleQuerySchema,
  matchActionBodySchema,
} from "@pacinho/shared";

import { MatchesService } from "./matches.service";

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(@Inject(MatchesService) private readonly matches: MatchesService) {}

  @Get("people")
  listPeople(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listPeopleQuerySchema))
    query: ListPeopleParams,
  ) {
    return this.matches.listPeople(user.sub, query);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.matches.list(user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  act(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(matchActionBodySchema)) body: MatchActionBody,
  ) {
    return this.matches.act(user.sub, body);
  }
}
