// 与后端 schemas 对应的类型定义

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
  template_count: number;
}

export interface CategoryCreate {
  name: string;
  color: string;
}

export interface PromptTemplate {
  id: number;
  title: string;
  category_id: number | null;
  content: string;
  notes: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  category_color: string | null;
}

export interface TemplateCreate {
  title: string;
  category_id: number | null;
  content: string;
  notes: string;
  favorite: boolean;
}

// 编辑时的部分更新
export type TemplateUpdate = Partial<TemplateCreate>;
