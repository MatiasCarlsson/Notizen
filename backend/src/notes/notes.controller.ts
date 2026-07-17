import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ArchiveNoteDto } from './dto/archive-note.dto';
import { CategoriesService } from '../categories/categories.service';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @ApiOperation({
    summary: 'Listar notas activas (filtrar por categoría con ?categoryId=)',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de notas activas' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'UUID de la categoría para filtrar',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Búsqueda en título/contenido',
  })
  @Get()
  async findAllActive(
    @Query() options: PageOptionsDto,
    @Query('categoryId') categoryId?: string,
  ) {
    if (categoryId)
      return await this.notesService.findByCategory(categoryId, options);
    return await this.notesService.findAllActive(options);
  }

  @ApiOperation({ summary: 'Listar notas archivadas' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de notas archivadas',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Búsqueda en título/contenido',
  })
  @Get('archived')
  async findAllArchived(@Query() options: PageOptionsDto) {
    return await this.notesService.findAllArchived(options);
  }

  @ApiOperation({ summary: 'Obtener nota por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota encontrada' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear nueva nota' })
  @ApiResponse({ status: 201, description: 'Nota creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Post()
  async create(@Body() dto: CreateNoteDto) {
    return await this.notesService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota actualizada' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return await this.notesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota eliminada' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.notesService.remove(id);
  }

  @ApiOperation({
    summary: 'Archivar o desarchivar nota (isArchived: true/false)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Estado de archivo actualizado' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @Patch(':id/archive')
  setArchiveStatus(@Param('id') id: string, @Body() dto: ArchiveNoteDto) {
    return this.notesService.setArchiveStatus(id, dto.isArchived);
  }

  // ─── Relación Nota ↔ Categoría ──────────────────────────────────────

  @ApiOperation({ summary: 'Obtener categorías de una nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Lista de categorías de la nota' })
  @Get(':id/categories')
  getCategoriesOfNote(@Param('id') noteId: string) {
    return this.categoriesService.findByNote(noteId);
  }

  @ApiOperation({ summary: 'Agregar categoría a una nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiResponse({ status: 201, description: 'Categoría agregada a la nota' })
  @Post(':id/categories/:categoryId')
  addCategoryToNote(
    @Param('id') noteId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.addCategoryToNote(noteId, categoryId);
  }

  @ApiOperation({ summary: 'Quitar categoría de una nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría quitada de la nota' })
  @Delete(':id/categories/:categoryId')
  removeCategoryFromNote(
    @Param('id') noteId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.removeCategoryFromNote(noteId, categoryId);
  }
}
