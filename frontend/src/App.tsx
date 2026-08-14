import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, PromptTemplate, TemplateCreate } from "./types";
import {
  createTemplate,
  deleteTemplate,
  fetchCategories,
  fetchTemplates,
  toggleFavorite,
  updateTemplate,
} from "./api/client";
import TemplateCard from "./components/TemplateCard";
import TemplateModal from "./components/TemplateModal";
import CategoryModal from "./components/CategoryModal";
import Toast from "./components/Toast";

export default function App() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [onlyFavorite, setOnlyFavorite] = useState(false);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
    } catch {
      showToast("加载分类失败，请确认后端已启动");
    }
  }, [showToast]);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await fetchTemplates({
        search: search.trim() || undefined,
        category_id: activeCategory ?? undefined,
        favorite: onlyFavorite ? true : undefined,
      });
      setTemplates(data);
    } catch {
      showToast("加载模板失败，请确认后端已启动");
    }
  }, [search, activeCategory, onlyFavorite, showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 搜索输入做 300ms 防抖
  useEffect(() => {
    const id = window.setTimeout(loadTemplates, 300);
    return () => window.clearTimeout(id);
  }, [loadTemplates]);

  const stats = useMemo(() => {
    const favCount = templates.filter((t) => t.favorite).length;
    return { total: templates.length, favCount };
  }, [templates]);

  // ---------- 模板增删改 ----------
  async function handleSubmitTemplate(payload: TemplateCreate) {
    try {
      if (editing) {
        await updateTemplate(editing.id, payload);
        showToast("模板已更新");
      } else {
        await createTemplate(payload);
        showToast("模板已创建");
      }
      setShowTemplateModal(false);
      setEditing(null);
      await Promise.all([loadTemplates(), loadCategories()]);
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? "保存失败");
    }
  }

  async function handleDelete(t: PromptTemplate) {
    if (!window.confirm("确定删除模板「" + t.title + "」？")) return;
    try {
      await deleteTemplate(t.id);
      showToast("模板已删除");
      await Promise.all([loadTemplates(), loadCategories()]);
    } catch {
      showToast("删除失败");
    }
  }

  async function handleToggleFavorite(t: PromptTemplate) {
    // 乐观更新，失败再回滚
    setTemplates((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, favorite: !x.favorite } : x))
    );
    try {
      await toggleFavorite(t.id);
      if (onlyFavorite) await loadTemplates();
    } catch {
      showToast("操作失败");
      await loadTemplates();
    }
  }

  async function handleCopy(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 回退方案：不支持 Clipboard API 时用隐藏 textarea
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败，请手动复制");
    }
  }

  function openCreate() {
    setEditing(null);
    setShowTemplateModal(true);
  }

  function openEdit(t: PromptTemplate) {
    setEditing(t);
    setShowTemplateModal(true);
  }

  return (
    <>
      <header className="topbar">
        <img className="logo" src="/prompt.svg" alt="logo" />
        <div>
          <h1>AI Prompt 模板管理工作台</h1>
        </div>
        <span className="sub">
          {stats.total} 个模板 · {stats.favCount} 个收藏
        </span>
        <span className="spacer" />
        <button className="btn" onClick={() => setShowCategoryModal(true)}>
          🗂 分类管理
        </button>
        <button className="btn btn-primary" onClick={openCreate}>
          ＋ 新增模板
        </button>
      </header>

      <main className="container">
        <div className="toolbar">
          <div className="search-box">
            <span className="icon">🔍</span>
            <input
              value={search}
              placeholder="搜索标题或 prompt 内容……"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={"chip" + (onlyFavorite ? " active" : "")}
            onClick={() => setOnlyFavorite((v) => !v)}
          >
            ★ 只看收藏
          </button>
        </div>

        <div className="chips">
          <span
            className={"chip" + (activeCategory === null ? " active" : "")}
            onClick={() => setActiveCategory(null)}
          >
            全部
          </span>
          {categories.map((c) => (
            <span
              key={c.id}
              className={"chip" + (activeCategory === c.id ? " active" : "")}
              onClick={() => setActiveCategory(c.id)}
            >
              <span className="dot" style={{ background: c.color }} />
              {c.name}
              <span className="count">{c.template_count}</span>
            </span>
          ))}
        </div>

        {templates.length === 0 ? (
          <div className="empty">
            <div className="big">🗒️</div>
            <div>没有匹配的模板。换个关键词，或点击右上角「新增模板」。</div>
          </div>
        ) : (
          <div className="grid">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </main>

      {showTemplateModal && (
        <TemplateModal
          template={editing}
          categories={categories}
          onClose={() => {
            setShowTemplateModal(false);
            setEditing(null);
          }}
          onSubmit={handleSubmitTemplate}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onChanged={() => {
            loadCategories();
            loadTemplates();
          }}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}
