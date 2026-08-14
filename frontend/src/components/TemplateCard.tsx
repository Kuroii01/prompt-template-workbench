import { useState } from "react";
import type { PromptTemplate } from "../types";

interface Props {
  template: PromptTemplate;
  onEdit: (t: PromptTemplate) => void;
  onDelete: (t: PromptTemplate) => void;
  onToggleFavorite: (t: PromptTemplate) => void;
  onCopy: (text: string) => void;
}

export default function TemplateCard({
  template,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
}: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy(template.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{template.title}</h3>
        <button
          className={"star-btn" + (template.favorite ? " on" : "")}
          title={template.favorite ? "取消收藏" : "收藏"}
          onClick={() => onToggleFavorite(template)}
        >
          {template.favorite ? "★" : "☆"}
        </button>
      </div>

      {template.category_name ? (
        <span
          className="tag"
          style={{ background: template.category_color ?? "#6366f1" }}
        >
          {template.category_name}
        </span>
      ) : (
        <span className="tag" style={{ background: "#9ca3af" }}>
          未分类
        </span>
      )}

      <div className="card-content">{template.content}</div>

      {template.notes && (
        <div className="card-notes">
          <b>用途：</b>
          {template.notes}
        </div>
      )}

      <div className="card-actions">
        <button
          className={"btn btn-copy" + (copied ? " copied" : "")}
          onClick={handleCopy}
        >
          {copied ? "✓ 已复制" : "⧉ 复制"}
        </button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={() => onEdit(template)}>
          编辑
        </button>
        <button
          className="btn btn-ghost btn-danger"
          onClick={() => onDelete(template)}
        >
          删除
        </button>
      </div>
    </div>
  );
}
