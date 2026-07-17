import { useState, useCallback, useEffect } from "react";
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  PageMeta,
  PageOptions,
} from "../types/note.types";
import { notesApi } from "../api/notes.api";

type Filter = "active" | "archived" | string; // string = categoryId

const DEFAULT_LIMIT = 20;

export const useNotes = (filter: Filter = "active") => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (opts: PageOptions & { page: number }, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res =
          filter === "archived"
            ? await notesApi.getArchived(opts)
            : typeof filter === "string" && filter !== "active"
              ? await notesApi.getByCategory(filter, opts)
              : await notesApi.getActive(opts);

        setNotes((prev) => (append ? [...prev, ...res.data] : res.data));
        setMeta(res.meta);
      } catch {
        setError("Error al cargar las notas.");
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [filter],
  );

  useEffect(() => {
    void fetchPage({ page: 1, limit: DEFAULT_LIMIT }, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!meta || meta.page >= meta.totalPages) return;
    const next = meta.page + 1;
    void fetchPage({ page: next, limit: DEFAULT_LIMIT }, true);
  }, [meta, fetchPage]);

  const hasMore = !!meta && meta.page < meta.totalPages;

  const createNote = async (payload: CreateNotePayload): Promise<Note> => {
    const newNote = await notesApi.create(payload);
    // Agrega la nueva nota al inicio de la lista sin recargar todo
    setNotes((prev) => [newNote, ...prev]);
    setMeta((prev) =>
      prev ? { ...prev, total: prev.total + 1 } : prev,
    );
    return newNote;
  };

  const updateNote = async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    // El backend ya retorna la nota completa con note_categories
    const updated = await notesApi.update(id, payload);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  };

  const deleteNote = async (id: string) => {
    await notesApi.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setMeta((prev) => (prev ? { ...prev, total: prev.total - 1 } : prev));
  };

  const setArchiveStatus = async (id: string, isArchived: boolean) => {
    await notesApi.setArchiveStatus(id, { isArchived });
    // Si el filtro es 'active' o 'archived', la nota desaparece de la lista actual
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setMeta((prev) => (prev ? { ...prev, total: prev.total - 1 } : prev));
  };

  // Actualiza una única nota en la lista sin recargar todo (útil para actualizaciones optimistas)
  const updateNoteInList = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  return {
    notes,
    meta,
    loading,
    loadingMore,
    error,
    hasMore,
    refresh: () => fetchPage({ page: 1, limit: DEFAULT_LIMIT }, false),
    loadMore,
    createNote,
    updateNote,
    deleteNote,
    setArchiveStatus,
    updateNoteInList,
  };
};
