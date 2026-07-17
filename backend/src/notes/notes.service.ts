import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import {
  PageOptionsDto,
  PaginatedResult,
} from '../common/dto/page-options.dto';
import { notes } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async findAllActive(
    options: PageOptionsDto,
  ): Promise<PaginatedResult<notes>> {
    const { data, total } = await this.notesRepository.findAll(false, options);
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllArchived(
    options: PageOptionsDto,
  ): Promise<PaginatedResult<notes>> {
    const { data, total } = await this.notesRepository.findAll(true, options);
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const note = await this.notesRepository.findById(id);
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);
    return note;
  }

  async findByCategory(
    categoryId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<notes>> {
    const { data, total } = await this.notesRepository.findByCategory(
      categoryId,
      options,
    );
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  create(dto: CreateNoteDto) {
    return this.notesRepository.create(dto);
  }

  async update(id: string, dto: UpdateNoteDto) {
    await this.findOne(id);
    return this.notesRepository.update(id, dto);
  }

  async remove(id: string) {
    const note = await this.findOne(id);
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);
    return this.notesRepository.delete(id);
  }

  async setArchiveStatus(id: string, isArchived: boolean) {
    await this.findOne(id);
    return this.notesRepository.updateArchiveStatus(id, isArchived);
  }
}
