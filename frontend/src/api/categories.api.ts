import api from "../lib/axios";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import type { Paginated, PageOptions } from "../types/note.types";

export const categoriesApi = {
  getAll: (options: PageOptions = {}) =>
    api.get<Paginated<Category>>("/categories", { params: options }).then((r) => r.data),

  getById: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (payload: CreateCategoryPayload) =>
    api.post<Category>("/categories", payload).then((r) => r.data),

  update: (id: string, payload: UpdateCategoryPayload) =>
    api.patch<Category>(`/categories/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),

  getCategoriesOfNote: (noteId: string) =>
    api.get<Category[]>(`/notes/${noteId}/categories`).then((r) => r.data),

  addToNote: (noteId: string, categoryId: string) =>
    api.post(`/notes/${noteId}/categories/${categoryId}`).then((r) => r.data),

  removeFromNote: (noteId: string, categoryId: string) =>
    api.delete(`/notes/${noteId}/categories/${categoryId}`).then((r) => r.data),
};
