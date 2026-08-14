import { useState } from "react";
import type { Category, PromptTemplate, TemplateCreate } from "../types";

interface Props {
  // 传入模板则为编辑模式，否则为新增模式
  template: PromptTemplate | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (payload: TemplateCreate) => void;
}

export default function TemplateModal({
  template,
  categories,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    template?.category_id ?? (categories[0]?.id ?? null)
  );
  const [content, setContent] = useState(template?.content ?? "");
  const [notes, setNotes] = useState(template?.notes ?? "");
  const [favorite, setFavorite] = useState(template?.favorite ?? false);
  const [error, setError] = useState("");

  const isEdit = template !== null;

  function handleSubmit() {
    if (!title.trim()) {
      setError("请填写模板标题");
      return;
    }
    if (!content.trim()) {
      setError("请填写 prompt 正文");
      return;
    }
    onSubmit({
      title: title.trim(),
      category_id: categoryId,
      content: content,
      notes: notes,
      favorite: favorite,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "编辑模板" : "新增模板"}</h2>

        <div className="field">
          <label>标题</label>
          <input
            value={title}
            placeholder="例如：代码审查助手"
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>分类</label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              style={{ width: "100%" }}
            >
              <option value="">未分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>收藏</label>
            <button
              type="button"
              className={"btn btn-block" + (favorite ? " btn-copy" : "")}
              onClick={() => setFavorite((v) => !v)}
            >
              {favorite ? "★ 已收藏" : "☆ 标记常用"}
            </button>
          </div>
        </div>

        <div className="field">
          <label>Prompt 正文</label>
          <textarea
            value={content}
            rows={7}
            placeholder="在此填写完整的提示词内容……"
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field">
          <label>用途备注</label>
          <textarea
            value={notes}
            rows={2}
            placeholder="这个模板用在什么场景？（选填）"
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {error && (
          <div style={{ color: "var(--danger)", fontSize: 13, marginTop: -6 }}>
            {error}
          </div>
        )}

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? "保存修改" : "创建模板"}
          </button>
        </div>
      </div>
    </div>
  );
}
