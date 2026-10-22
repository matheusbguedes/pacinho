import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { MatchesModule } from "./matches/matches.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    MatchesModule,
    ConversationsModule,
    HealthModule,
  ],
})
export class AppModule {}
