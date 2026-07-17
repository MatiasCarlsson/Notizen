import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categories } from '@prisma/client';
import {
  PageOptionsDto,
  PaginatedResult,
} from '../common/dto/page-options.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAllCategories(
    options: PageOptionsDto,
  ): Promise<PaginatedResult<categories>> {
    const { data, total } = await this.categoriesRepository.findAll(options);
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async findByNote(noteId: string) {
    return this.categoriesRepository.findByNote(noteId);
  }

  async addCategoryToNote(noteId: string, categoryId: string) {
    return this.categoriesRepository.addCategoryToNote(noteId, categoryId);
  }

  async removeCategoryFromNote(noteId: string, categoryId: string) {
    return this.categoriesRepository.removeCategoryFromNote(noteId, categoryId);
  }

  async create(data: CreateCategoryDto): Promise<categories> {
    return await this.categoriesRepository.create({
      name: data.name,
      ...(data.color !== undefined && { color: data.color }),
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.categoriesRepository.update(id, dto);
  }

  async removeCategory(id: string) {
    await this.findOne(id);
    return this.categoriesRepository.delete(id);
  }
}
