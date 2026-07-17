export interface Note {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  note_categories?: NoteCategory[];
}

export interface NoteCategory {
  noteId: string;
  categoryId: string;
  categories: Category;
}

import type { Category } from "./category.types";

export interface CreateNotePayload {
  title: string;
  content: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}

export interface ArchiveNotePayload {
  isArchived: boolean;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageOptions {
  page?: number;
  limit?: number;
  q?: string;
}
