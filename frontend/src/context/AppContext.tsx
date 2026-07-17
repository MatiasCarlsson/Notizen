import React, { createContext, useState, useEffect } from "react";
import type { Note, PageMeta } from "../types/note.types";
import type { CreateNotePayload, UpdateNotePayload } from "../types/note.types";
import type { CreateCategoryPayload } from "../types/category.types";
import { useNotes } from "../hooks/useNotes";
import { useCategories } from "../hooks/useCategories";
import { notesApi } from "../api/notes.api";

export interface AppContextValue {
  // Estado
  notes: Note[];
  notesLoading: boolean;
  notesLoadingMore: boolean;
  notesHasMore: boolean;
  notesMeta: PageMeta | null;
  selectedNote: Note | null;
  activeFilter: string;

  // Categorí­as
  categories: ReturnType<typeof useCategories>["categories"];
  categoriesLoading: boolean;
  theme: string;
  toggleTheme: () => void;

  // Acciones de notas
  setSelectedNote: (note: Note | null) => void;
  setActiveFilter: (filter: string) => void;
  createNote: (payload: CreateNotePayload) => Promise<Note>;
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  setArchiveStatus: (id: string, isArchived: boolean) => Promise<void>;
  refreshNotes: () => void;
  loadMoreNotes: () => void;

  // Acciones de categorí­as
  createCategory: (payload: CreateCategoryPayload) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCategoryToNote: (noteId: string, categoryId: string) => Promise<void>;
  removeCategoryFromNote: (noteId: string, categoryId: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const [activeFilter, setActiveFilter] = useState<string>("active");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const {
    notes,
    loading: notesLoading,
    loadingMore: notesLoadingMore,
    hasMore: notesHasMore,
    meta: notesMeta,
    refresh: refreshNotes,
    loadMore,
    createNote,
    updateNote,
    deleteNote,
    setArchiveStatus,
    updateNoteInList,
  } = useNotes(activeFilter);

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    deleteCategory,
    addCategoryToNote,
    removeCategoryFromNote,
  } = useCategories();

  // Al archivar/desarchivar, deseleccionar la nota si estaba abierta
  const handleArchive = async (id: string, isArchived: boolean) => {
    await setArchiveStatus(id, isArchived);
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  // Al eliminar, deseleccionar si estaba abierta
  const handleDelete = async (id: string) => {
    await deleteNote(id);
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleUpdate = async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    // updateNote ya retorna la nota completa, reutilizamos sin llamada extra
    const updated = await updateNote(id, payload);
    if (selectedNote?.id === id) setSelectedNote(updated);
    return updated;
  };

  // Sincroniza selectedNote y la lista de notas tras agregar/quitar categoría
  const handleAddCategory = async (noteId: string, categoryId: string) => {
    await addCategoryToNote(noteId, categoryId);
    // Una sola llamada para sincronizar el NoteCard y el editor
    const updated = await notesApi.getById(noteId);
    updateNoteInList(updated);
    if (selectedNote?.id === noteId) setSelectedNote(updated);
  };

  const handleRemoveCategory = async (noteId: string, categoryId: string) => {
    await removeCategoryFromNote(noteId, categoryId);
    const updated = await notesApi.getById(noteId);
    updateNoteInList(updated);
    if (selectedNote?.id === noteId) setSelectedNote(updated);
  };

  return (
    <AppContext.Provider
      value={{
        notes,
        notesLoading,
        notesLoadingMore,
        notesHasMore,
        notesMeta,
        selectedNote,
        activeFilter,
        categories,
        categoriesLoading,
        theme,
        toggleTheme,
        setSelectedNote,
        setActiveFilter,
        createNote,
        updateNote: handleUpdate,
        deleteNote: handleDelete,
        setArchiveStatus: handleArchive,
        refreshNotes,
        loadMoreNotes: loadMore,
        createCategory,
        deleteCategory,
        addCategoryToNote: handleAddCategory,
        removeCategoryFromNote: handleRemoveCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


