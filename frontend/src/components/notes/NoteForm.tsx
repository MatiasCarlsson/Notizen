import React, { useState } from "react";
import type { CreateNotePayload } from "../../types/note.types";
import type { Category } from "../../types/category.types";
import { Button } from "../ui/Button";

interface NoteFormProps {
  allCategories: Category[];
  onSubmit: (payload: CreateNotePayload, categoryIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({ allCategories, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCat = (id: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("El título y el contenido son obligatorios.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() }, Array.from(selectedCats));
    } catch {
      setError("No se pudo crear la nota. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tí­tulo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider pl-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota..."
          className="bg-(--bg-sidebar) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-primary) placeholder-[#5a6578] text-sm focus:outline-none focus:border-(--border-focus) focus:ring-2 focus:ring-[#4a90d9]/20 transition-all"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider pl-1">
          Contenido
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribí tu nota aquí..."
          rows={4}
          className="bg-(--bg-sidebar) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-primary) placeholder-[#5a6578] text-sm resize-none focus:outline-none focus:border-(--border-focus) focus:ring-2 focus:ring-[#4a90d9]/20 transition-all"
        />
      </div>

      {/* Selector de categorí­as */}
      {allCategories.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider pl-1">
            Categoría (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const isSelected = selectedCats.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCat(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer  transition-all ${isSelected ? "border-transparent text-white" : "border-(--border-subtle) text-(--text-secondary) hover:border-[#4a5568] hover:text-(--text-primary)"}`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: cat.color ?? "#4a90d9",
                          borderColor: cat.color ?? "#4a90d9",
                          cursor: "pointer",
                        }
                      : {}
                  }
                >
                  <span
                    className="size-2 rounded-full cursor-pointer"
                    style={{ backgroundColor: cat.color ?? "#8892a0" }}
                  />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-[#ef4444] px-1">{error}</p>}

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          Crear nota
        </Button>
      </div>
    </form>
  );
};
