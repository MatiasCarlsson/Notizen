import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeCategories = {
    note_categories: {
      include: { categories: true },
    },
  } as const;

  private buildSearchFilter(q?: string): Prisma.notesWhereInput {
    if (!q || q.trim() === '') return {};
    const term = q.trim();
    return {
      OR: [{ title: { contains: term } }, { content: { contains: term } }],
    };
  }

  async findAll(isArchived: boolean, options: PageOptionsDto) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const where: Prisma.notesWhereInput = {
      isArchived,
      ...this.buildSearchFilter(options.q),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notes.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.includeCategories,
      }),
      this.prisma.notes.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return this.prisma.notes.findUnique({
      where: { id },
      include: this.includeCategories,
    });
  }

  async findByCategory(categoryId: string, options: PageOptionsDto) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const where: Prisma.notesWhereInput = {
      isArchived: false,
      note_categories: { some: { categoryId } },
      ...this.buildSearchFilter(options.q),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notes.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.includeCategories,
      }),
      this.prisma.notes.count({ where }),
    ]);

    return { data, total };
  }

  create(data: CreateNoteDto) {
    return this.prisma.notes.create({
      data: { ...data, updatedAt: new Date() },
      include: {
        note_categories: {
          include: { categories: true },
        },
      },
    });
  }

  update(id: string, data: UpdateNoteDto) {
    return this.prisma.notes.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        note_categories: {
          include: { categories: true },
        },
      },
    });
  }

  delete(id: string) {
    return this.prisma.notes.delete({ where: { id } });
  }

  updateArchiveStatus(id: string, isArchived: boolean) {
    return this.prisma.notes.update({
      where: { id },
      data: { isArchived, updatedAt: new Date() },
    });
  }
}
