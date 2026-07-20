import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, NotesModule, CategoriesModule, HealthModule],
})
export class AppModule {}
