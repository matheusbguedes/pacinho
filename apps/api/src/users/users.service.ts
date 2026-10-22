import { ageFromBirthDate, parseBirthDate } from "@/common/birth-date";
import { ownProfileSelect, toOwnProfile } from "@/common/own-profile";
import { uploadDirectory } from "@/common/uploads";
import { PrismaService } from "@/prisma/prisma.service";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { UpdateProfileBody } from "@pacinho/shared";
import type { Prisma } from "@prisma-client";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: ownProfileSelect,
    });
    if (!user) {
      throw new NotFoundException({ message: "Usuário não encontrado" });
    }

    return toOwnProfile(user);
  }

  async updateMe(userId: string, data: UpdateProfileBody) {
    const { birth_date: birthDate, ...rest } = data;
    const stored: Prisma.UserUpdateInput = { ...rest };

    if (birthDate !== undefined) {
      if (birthDate === null) {
        stored.birth_date = null;
        stored.age = null;
      } else {
        const parsed = parseBirthDate(birthDate);
        if (!parsed) {
          throw new BadRequestException({
            message: "Data de nascimento inválida",
          });
        }
        const age = ageFromBirthDate(parsed);
        if (age < 18 || age > 100) {
          throw new BadRequestException({
            message: "A idade precisa estar entre 18 e 100",
          });
        }
        stored.birth_date = parsed;
        stored.age = age;
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: stored,
      select: ownProfileSelect,
    });

    return toOwnProfile(user);
  }

  async addMedia(
    userId: string,
    file: { buffer: Buffer; mimetype: string },
    origin: string,
  ) {
    const extension = IMAGE_EXTENSIONS[file.mimetype];
    if (!extension || file.buffer.length === 0) {
      throw new BadRequestException({ message: "Envie uma imagem" });
    }

    const filename = `${randomUUID()}${extension}`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(join(uploadDirectory, filename), file.buffer);

    const last = await this.prisma.userMedia.findFirst({
      where: { user_id: userId },
      orderBy: { sort_order: "desc" },
      select: { sort_order: true },
    });

    return this.prisma.userMedia.create({
      data: {
        user_id: userId,
        url: `${origin}/media/${filename}`,
        sort_order: (last?.sort_order ?? -1) + 1,
      },
      select: {
        id: true,
        url: true,
        sort_order: true,
      },
    });
  }
}
