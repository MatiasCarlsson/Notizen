import React from "react";
import type { PageMeta } from "../../types/note.types";
import { Button } from "../ui/Button";

interface PaginationProps {
  meta: PageMeta | null;
  loadingMore?: boolean;
  onLoadMore: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  loadingMore = false,
  onLoadMore,
}) => {
  if (!meta) return null;

  const { total, page, totalPages } = meta;
  const hasMore = page < totalPages;

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <p className="text-xs text-(--text-secondary)">
        {total} {total === 1 ? "nota" : "notas"} · página {page} de {totalPages}
      </p>
      {hasMore && (
        <Button variant="ghost" onClick={onLoadMore} loading={loadingMore}>
          Cargar más
        </Button>
      )}
    </div>
  );
};
