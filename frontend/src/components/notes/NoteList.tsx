import React from "react";
import type { Note, PageMeta } from "../../types/note.types";
import { NoteCard } from "./NoteCard";
import { EmptyState } from "../ui/EmptyState";
import { Pagination } from "./Pagination";

interface NoteListProps {
  notes: Note[];
  loading?: boolean;
  loadingMore?: boolean;
  meta?: PageMeta | null;
  onSelect: (note: Note) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
  onNewNote?: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  loading = false,
  loadingMore = false,
  meta = null,
  onSelect,
  onArchive,
  onDelete,
  onLoadMore,
  onNewNote,
}) => {
  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <div className="w-8 h-8 border-2 border-(--border-focus) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sin notas
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No hay notas aquí"
        message="Creá una nueva nota para empezar."
        actionLabel={onNewNote ? "+ Nueva nota" : undefined}
        onAction={onNewNote}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={onSelect}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
      <Pagination meta={meta} loadingMore={loadingMore} onLoadMore={onLoadMore} />
    </>
  );
};
