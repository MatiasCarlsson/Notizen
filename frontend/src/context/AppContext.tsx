import React, { createContext, useState, useEffect } from "react";
import type { Note, PageMeta, NoteCategory } from "../types/note.types";
import type { CreateNotePayload, UpdateNotePayload } from "../types/note.types";
import type { CreateCategoryPayload, Category } from "../types/category.types";
import { useNotes } from "../hooks/useNotes";
import { useCategories } from "../hooks/useCategories";

export interface AppContextValue {
  // Estado
  notes: Note[];
  notesLoading: boolean;
  notesLoadingMore: boolean;
  notesHasMore: boolean;
  notesMeta: PageMeta | null;
  selectedNote: Note | null;
  activeFilter: string;

  // Categorías
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

  // Acciones de categorías
  createCategory: (payload: CreateCategoryPayload) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCategoryToNote: (noteId: string, categoryId: string) => Promise<void>;
  removeCategoryFromNote: (noteId: string, categoryId: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextValue | null>(null);

const buildNoteCategory = (noteId: string, category: Category): NoteCategory => ({
  noteId,
  categoryId: category.id,
  categories: category,
});

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
    try {
      await setArchiveStatus(id, isArchived);
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch {
      // Error ya rollback en useNotes
    }
  };

  // Al eliminar, deseleccionar si estaba abierta
  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch {
      // Error ya rollback en useNotes
    }
  };

  const handleUpdate = async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const updated = await updateNote(id, payload);
    if (selectedNote?.id === id) setSelectedNote(updated);
    return updated;
  };

  // Sincroniza selectedNote y la lista de notas tras agregar/quitar categoría (optimista, sin getById extra)
  const handleAddCategory = async (noteId: string, categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      await addCategoryToNote(noteId, categoryId);
      return;
    }

    const newNoteCategory = buildNoteCategory(noteId, category);

    // Optimista: agregar categoría a la nota en la lista y en selectedNote
    const addCategoryToNoteObj = (note: Note): Note => {
      const noteCats = note.note_categories ?? [];
      if (noteCats.some((nc) => nc.categoryId === categoryId)) return note;
      return { ...note, note_categories: [...noteCats, newNoteCategory] };
    };

    updateNoteInList(noteId, addCategoryToNoteObj);
    if (selectedNote?.id === noteId) setSelectedNote(addCategoryToNoteObj(selectedNote));

    try {
      await addCategoryToNote(noteId, categoryId);
    } catch {
      // Rollback: remover la categoría de la nota
      const rollbackRemove = (note: Note): Note => ({
        ...note,
        note_categories: note.note_categories?.filter((nc) => nc.categoryId !== categoryId) ?? [],
      });
      updateNoteInList(noteId, rollbackRemove);
      if (selectedNote?.id === noteId) setSelectedNote(rollbackRemove(selectedNote));
      throw new Error("Error al agregar la categoría.");
    }
  };

  const handleRemoveCategory = async (noteId: string, categoryId: string) => {
    // Optimista: remover categoría de la nota en la lista y en selectedNote
    const applyRemove = (note: Note): Note => ({
      ...note,
      note_categories: note.note_categories?.filter((nc) => nc.categoryId !== categoryId) ?? [],
    });

    updateNoteInList(noteId, applyRemove);
    if (selectedNote?.id === noteId) setSelectedNote(applyRemove(selectedNote));

    try {
      await removeCategoryFromNote(noteId, categoryId);
    } catch {
      // Rollback: restaurar la categoría (necesitamos los datos de la categoría)
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const newNoteCategory = buildNoteCategory(noteId, category);
        const rollbackAdd = (note: Note): Note => {
          const noteCats = note.note_categories ?? [];
          if (noteCats.some((nc) => nc.categoryId === categoryId)) return note;
          return { ...note, note_categories: [...noteCats, newNoteCategory] };
        };
        updateNoteInList(noteId, rollbackAdd);
        if (selectedNote?.id === noteId) setSelectedNote(rollbackAdd(selectedNote));
      }
      throw new Error("Error al quitar la categoría.");
    }
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
