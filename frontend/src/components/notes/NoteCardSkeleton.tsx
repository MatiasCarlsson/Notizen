import React from "react";

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-(--bg-card) rounded-xl p-5 border border-(--border-subtle) flex flex-col gap-3 animate-pulse">
      <div className="h-6 bg-(--bg-hover) rounded w-3/4"></div>
      <div className="h-4 bg-(--bg-hover) rounded w-full"></div>
      <div className="h-4 bg-(--bg-hover) rounded w-5/6"></div>
      <div className="flex gap-1.5 mt-2">
        <div className="h-5 bg-(--bg-hover) rounded-full w-16"></div>
      </div>
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-(--border-subtle)">
        <div className="h-4 bg-(--bg-hover) rounded w-24"></div>
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-(--bg-hover) rounded"></div>
          <div className="h-6 w-6 bg-(--bg-hover) rounded"></div>
        </div>
      </div>
    </div>
  );
};
