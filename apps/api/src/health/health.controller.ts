import { Controller, Get, Inject } from "@nestjs/common";

import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(@Inject(HealthService) private readonly health: HealthService) {}

  @Get("health")
  check() {
    return this.health.check();
  }
}
