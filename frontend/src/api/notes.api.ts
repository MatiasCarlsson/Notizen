import api from "../lib/axios";
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  ArchiveNotePayload,
  Paginated,
  PageOptions,
} from "../types/note.types";

export const notesApi = {
  getActive: (options: PageOptions = {}) =>
    api.get<Paginated<Note>>("/notes", { params: options }).then((r) => r.data),

  getArchived: (options: PageOptions = {}) =>
    api
      .get<Paginated<Note>>("/notes/archived", { params: options })
      .then((r) => r.data),

  getById: (id: string) => api.get<Note>(`/notes/${id}`).then((r) => r.data),

  getByCategory: (categoryId: string, options: PageOptions = {}) =>
    api
      .get<Paginated<Note>>("/notes", {
        params: { categoryId, ...options },
      })
      .then((r) => r.data),

  create: (payload: CreateNotePayload) =>
    api.post<Note>("/notes", payload).then((r) => r.data),

  update: (id: string, payload: UpdateNotePayload) =>
    api.patch<Note>(`/notes/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/notes/${id}`).then((r) => r.data),

  setArchiveStatus: (id: string, payload: ArchiveNotePayload) =>
    api.patch<Note>(`/notes/${id}/archive`, payload).then((r) => r.data),
};
