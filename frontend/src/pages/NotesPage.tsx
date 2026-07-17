/**
 * NotesPage.tsx
 *
 * QUÃ‰ HACE:
 *   Vista principal de notas activas (no archivadas).
 *   Muestra el Layout con el NoteList filtrado segÃºn el filtro activo
 *   del sidebar (todas o por categorÃ­a).
 *   Al hacer clic en una nota abre el NoteEditor.
 *   Contiene el botÃ³n para crear una nueva nota (abre NoteForm en Modal).
 *
 * DÃ“NDE SE USA:
 *   Ruta "/" en App.tsx / router.
 */

import React, { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { NoteList } from "../components/notes/NoteList";
import { NoteEditor } from "../components/notes/NoteEditor";
import { NoteForm } from "../components/notes/NoteForm";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";

interface NotesPageProps {
  onFilterChange: (filter: string) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ onFilterChange }) => {
  const {
    notes,
    notesLoading,
    notesLoadingMore,
    notesMeta,
    loadMoreNotes,
    selectedNote,
    activeFilter,
    categories,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
    setArchiveStatus,
    addCategoryToNote,
    removeCategoryFromNote,
    createCategory,
    deleteCategory,
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4a90d9");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const activeCategoryColor = categories.find((c) => c.id === activeFilter)?.color ?? undefined;

  const headerTitle =
    activeFilter === "active"
      ? "Notas activas"
      : (categories.find((c) => c.id === activeFilter)?.name ?? "Notas");

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      await createCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      setNewCategoryName("");
      setNewCategoryColor("#4a90d9");
      setIsCategoryFormOpen(false);
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Layout
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      categories={categories}
      onNewCategory={() => setIsCategoryFormOpen(true)}
      onDeleteCategory={deleteCategory}
      onNewNote={() => setIsFormOpen(true)}
    >
      <Header
        title={headerTitle}
        categoryColor={activeCategoryColor}
        onNewNote={() => setIsFormOpen(true)}
      />

      <NoteList
        notes={notes}
        loading={notesLoading}
        loadingMore={notesLoadingMore}
        meta={notesMeta}
        onSelect={setSelectedNote}
        onArchive={setArchiveStatus}
        onDelete={deleteNote}
        onLoadMore={loadMoreNotes}
        onNewNote={() => setIsFormOpen(true)}
      />

      {selectedNote && (
        <Modal isOpen={!!selectedNote} onClose={() => setSelectedNote(null)}>
          <NoteEditor
            note={selectedNote}
            allCategories={categories}
            onClose={() => setSelectedNote(null)}
            onSave={updateNote}
            onArchive={setArchiveStatus}
            onAddCategory={addCategoryToNote}
            onRemoveCategory={removeCategoryFromNote}
          />
        </Modal>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nueva nota">
        <NoteForm
          allCategories={categories}
          onSubmit={async (payload, categoryIds) => {
            const newNote = await createNote(payload);
            for (const catId of categoryIds) {
              await addCategoryToNote(newNote.id, catId);
            }
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        title="Nueva categoría"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-(--text-secondary) tracking-widest">Nombre</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
              placeholder="Ej: Trabajo, Personal..."
              className="bg-(--bg-primary) text-(--text-primary) text-sm px-3 py-2 rounded-lg border border-(--border-subtle) focus:outline-none focus:border-(--border-focus) transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--text-secondary) tracking-widest">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="size-10 rounded-lg cursor-pointer border border-(--border-subtle) bg-transparent"
              />
              <span className="text-sm text-(--text-secondary)">{newCategoryColor}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCategoryFormOpen(false)}
              className="px-4 py-2 text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || creatingCategory}
              className="px-4 py-2 text-sm bg-[#4a90d9] hover:bg-[#357abd] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingCategory ? "Creando..." : "Crear categoría"}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
