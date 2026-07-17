import { useState, useCallback, useEffect } from "react";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { categoriesApi } from "../api/categories.api";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data.data);
    } catch {
      setError("Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (payload: CreateCategoryPayload) => {
    const created = await categoriesApi.create(payload);
    setCategories((prev) => [...prev, created]);
  };

  const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
    const updated = await categoriesApi.update(id, payload);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCategory = async (id: string) => {
    await categoriesApi.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addCategoryToNote = async (noteId: string, categoryId: string) => {
    await categoriesApi.addToNote(noteId, categoryId);
  };

  const removeCategoryFromNote = async (noteId: string, categoryId: string) => {
    await categoriesApi.removeFromNote(noteId, categoryId);
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    addCategoryToNote,
    removeCategoryFromNote,
  };
};
