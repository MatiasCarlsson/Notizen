import React from "react";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { NoteList } from "../components/notes/NoteList";
import { NoteEditor } from "../components/notes/NoteEditor";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";
interface ArchivedPageProps {
  onFilterChange: (filter: string) => void;
}

export const ArchivedPage: React.FC<ArchivedPageProps> = ({ onFilterChange }) => {
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
    updateNote,
    deleteNote,
    setArchiveStatus,
    addCategoryToNote,
    removeCategoryFromNote,
    deleteCategory,
  } = useAppContext();

  return (
    <Layout
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      categories={categories}
      onNewCategory={() => {}}
      onDeleteCategory={deleteCategory}
    >
      <Header title="Archivadas" />

      <NoteList
        notes={notes}
        loading={notesLoading}
        loadingMore={notesLoadingMore}
        meta={notesMeta}
        onSelect={setSelectedNote}
        onArchive={setArchiveStatus}
        onDelete={deleteNote}
        onLoadMore={loadMoreNotes}
      />

      {selectedNote && (
        <Modal isOpen={!!selectedNote} onClose={() => setSelectedNote(null)}>
          <NoteEditor
            key={selectedNote.id}
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
    </Layout>
  );
};
