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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Listar todas las categorias' })
  @ApiResponse({ status: 200, description: 'Lista paginada de categorias' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Búsqueda por nombre' })
  @Get()
  async findAll(@Query() options: PageOptionsDto) {
    return await this.categoriesService.findAllCategories(options);
  }

  @ApiOperation({ summary: 'Obtener categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear nueva categoria' })
  @ApiResponse({ status: 201, description: 'Categoria creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoriesService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar categoria' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({
    status: 200,
    description: 'Categoria actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return await this.categoriesService.updateCategory(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar categoria' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({ status: 200, description: 'Categoria eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoriesService.removeCategory(id);
  }

  // ─── Relación Nota ↔ Categoría ──────────────────────────────────────

  @ApiOperation({ summary: 'Listar categorías de una nota' })
  @ApiParam({ name: 'noteId', description: 'UUID de la nota' })
  @ApiResponse({ status: 200, description: 'Categorías de la nota' })
  @Get('notes/:noteId/categories')
  getCategoriesOfNote(@Param('noteId') noteId: string) {
    return this.categoriesService.findByNote(noteId);
  }

  @ApiOperation({ summary: 'Agregar categoría a una nota' })
  @ApiParam({ name: 'noteId', description: 'UUID de la nota' })
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiResponse({ status: 201, description: 'Categoría agregada a la nota' })
  @Post('notes/:noteId/categories/:categoryId')
  addCategoryToNote(
    @Param('noteId') noteId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.addCategoryToNote(noteId, categoryId);
  }

  @ApiOperation({ summary: 'Quitar categoría de una nota' })
  @ApiParam({ name: 'noteId', description: 'UUID de la nota' })
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría quitada de la nota' })
  @Delete('notes/:noteId/categories/:categoryId')
  removeCategoryFromNote(
    @Param('noteId') noteId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.removeCategoryFromNote(noteId, categoryId);
  }
}
