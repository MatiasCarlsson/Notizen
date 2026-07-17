import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, categories } from '@prisma/client';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: PageOptionsDto) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const where: Prisma.categoriesWhereInput = options.q
      ? { name: { contains: options.q.trim() } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.categories.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.categories.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<categories | null> {
    return await this.prisma.categories.findUnique({ where: { id } });
  }

  async findByNote(noteId: string): Promise<categories[]> {
    const relations = await this.prisma.note_categories.findMany({
      where: { noteId },
      include: { categories: true },
    });
    return relations
      .map((r) => r.categories)
      .filter((c): c is categories => c !== null);
  }

  async addCategoryToNote(noteId: string, categoryId: string) {
    try {
      return await this.prisma.note_categories.create({
        data: { noteId, categoryId },
      });
    } catch (e: any) {
      if (e.code === 'P2002') return { noteId, categoryId }; // Ya existe
      throw e;
    }
  }

  async removeCategoryFromNote(noteId: string, categoryId: string) {
    return await this.prisma.note_categories.delete({
      where: { noteId_categoryId: { noteId, categoryId } },
    });
  }

  async create(data: { name: string; color?: string }): Promise<categories> {
    return await this.prisma.categories.create({ data });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<categories> {
    return await this.prisma.categories.update({ where: { id }, data });
  }

  async delete(id: string): Promise<categories> {
    const exists = await this.findById(id);
    if (!exists)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return await this.prisma.categories.delete({ where: { id } });
  }
}
