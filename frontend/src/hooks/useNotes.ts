import { useState, useCallback, useEffect, useRef } from "react";
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

  // Ref para acceder al estado más reciente en callbacks asíncronos (rollback)
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

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
    const tempId = `temp_${Date.now()}`;
    const tempNote: Note = {
      id: tempId,
      title: payload.title,
      content: payload.content,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      note_categories: [],
    };

    // Optimista: agregar inmediatamente
    setNotes((prev) => [tempNote, ...prev]);
    setMeta((prev) =>
      prev ? { ...prev, total: prev.total + 1 } : prev,
    );

    try {
      const newNote = await notesApi.create(payload);
      // Reemplazar la nota temporal con la real
      setNotes((prev) => prev.map((n) => (n.id === tempId ? newNote : n)));
      return newNote;
    } catch {
      // Rollback: remover la nota temporal
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setMeta((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : prev,
      );
      throw new Error("Error al crear la nota.");
    }
  };

  const updateNote = async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const prevNote = notesRef.current.find((n) => n.id === id);

    // Optimista: actualizar inmediatamente
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...payload } : n)),
    );

    try {
      const updated = await notesApi.update(id, payload);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return updated;
    } catch {
      // Rollback: restaurar la nota anterior
      if (prevNote) {
        setNotes((prev) => prev.map((n) => (n.id === id ? prevNote : n)));
      }
      throw new Error("Error al actualizar la nota.");
    }
  };

  const deleteNote = async (id: string) => {
    const prevNotes = notesRef.current;

    // Optimista: remover inmediatamente
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setMeta((prev) =>
      prev ? { ...prev, total: prev.total - 1 } : prev,
    );

    try {
      await notesApi.delete(id);
    } catch {
      // Rollback: restaurar notas anteriores
      setNotes(prevNotes);
      setMeta((prev) =>
        prev ? { ...prev, total: prev.total + 1 } : prev,
      );
      throw new Error("Error al eliminar la nota.");
    }
  };

  const setArchiveStatus = async (id: string, isArchived: boolean) => {
    const prevNotes = notesRef.current;

    // Optimista: remover de la lista inmediatamente
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setMeta((prev) =>
      prev ? { ...prev, total: prev.total - 1 } : prev,
    );

    try {
      await notesApi.setArchiveStatus(id, { isArchived });
    } catch {
      // Rollback: restaurar notas anteriores
      setNotes(prevNotes);
      setMeta((prev) =>
        prev ? { ...prev, total: prev.total + 1 } : prev,
      );
      throw new Error("Error al cambiar el estado de la nota.");
    }
  };

  // Actualiza una única nota en la lista sin recargar todo (útil para actualizaciones optimistas)
  const updateNoteInList = (id: string, updater: (note: Note) => Note) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? updater(n) : n)));
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
