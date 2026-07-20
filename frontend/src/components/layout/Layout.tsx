/**
 * Layout.tsx
 *
 * QUÃ‰ HACE:
 *   Componente raÃ­z de la interfaz visual. Divide la pantalla en:
 *   - Sidebar (izquierda, fija): navegaciÃ³n y lista de categorÃ­as
 *   - Ãrea principal (derecha, flexible): children â†’ contenido de la pÃ¡gina
 *   Aplica el fondo oscuro global y el sistema de grid/flexbox del diseÃ±o.
 *
 * PROPS:
 *   children: React.ReactNode
 *   activeFilter, onFilterChange, categories, onNewCategory â†’ se pasan al Sidebar
 *
 * DÃ“NDE SE USA:
 *   Wrappea NotesPage y ArchivedPage.
 */

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import type { Category } from "../../types/category.types";

interface LayoutProps {
  children: React.ReactNode;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  categories: Category[];
  onNewCategory: () => void;
  onDeleteCategory: (id: string) => void;
  onNewNote?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeFilter,
  onFilterChange,
  categories,
  onNewCategory,
  onDeleteCategory,
  onNewNote,
}) => {
  const [showFreeNotice, setShowFreeNotice] = useState(false);

  useEffect(() => {
    setShowFreeNotice(localStorage.getItem("notizen_hide_free_notice") !== "1");
  }, []);

  const dismissFreeNotice = () => {
    localStorage.setItem("notizen_hide_free_notice", "1");
    setShowFreeNotice(false);
  };

  return (
    <div className="flex min-h-screen bg-(--bg-primary)">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        categories={categories}
        onNewCategory={onNewCategory}
        onDeleteCategory={onDeleteCategory}
        onNewNote={onNewNote}
      />

      {/* Área de contenido principal */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-(--bg-primary)">
        {showFreeNotice && (
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs text-(--text-secondary) bg-(--bg-hover) border-b border-(--border-subtle)"
            title="Notizen se ejecuta en servicios gratuitos de Render. La base de datos y el servidor pueden entrar en suspensión tras periodos de inactividad, lo que puede causar latencia en la primera carga."
          >
            <span aria-hidden="true">ℹ️</span>
            <span>
              Estás usando la versión gratuita de Notizen. El servidor y la base
              de datos pueden tardar unos segundos en reactivarse tras estar
              inactivos (latencia en la primera carga).
            </span>
            <button
              onClick={dismissFreeNotice}
              className="ml-auto px-2 py-0.5 rounded text-(--text-secondary) hover:bg-(--border-subtle) cursor-pointer"
              title="Ocultar aviso"
              aria-label="Ocultar aviso"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
