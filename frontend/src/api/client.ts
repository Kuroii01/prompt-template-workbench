import axios from "axios";
import type {
  Category,
  CategoryCreate,
  PromptTemplate,
  TemplateCreate,
  TemplateUpdate,
} from "../types";

// 直接请求后端完整地址，不依赖 Vite 代理（后端已开启 CORS）
const http = axios.create({ baseURL: "http://127.0.0.1:8001/api" });

// ---------- Categories ----------
export async function fetchCategories(): Promise<Category[]> {
  const { data } = await http.get<Category[]>("/categories");
  return data;
}

export async function createCategory(payload: CategoryCreate): Promise<Category> {
  const { data } = await http.post<Category>("/categories", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: Partial<CategoryCreate>
): Promise<Category> {
  const { data } = await http.put<Category>("/categories/" + id, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await http.delete("/categories/" + id);
}

// ---------- Templates ----------
export async function fetchTemplates(params?: {
  search?: string;
  category_id?: number;
  favorite?: boolean;
}): Promise<PromptTemplate[]> {
  const { data } = await http.get<PromptTemplate[]>("/templates", { params });
  return data;
}

export async function createTemplate(
  payload: TemplateCreate
): Promise<PromptTemplate> {
  const { data } = await http.post<PromptTemplate>("/templates", payload);
  return data;
}

export async function updateTemplate(
  id: number,
  payload: TemplateUpdate
): Promise<PromptTemplate> {
  const { data } = await http.put<PromptTemplate>("/templates/" + id, payload);
  return data;
}

export async function toggleFavorite(id: number): Promise<PromptTemplate> {
  const { data } = await http.patch<PromptTemplate>(
    "/templates/" + id + "/favorite"
  );
  return data;
}

export async function deleteTemplate(id: number): Promise<void> {
  await http.delete("/templates/" + id);
}
