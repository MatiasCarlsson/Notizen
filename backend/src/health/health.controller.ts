import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const result = await this.prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    return { status: "ok", db: result[0]?.ok === 1 ? "up" : "down" };
  }
}
