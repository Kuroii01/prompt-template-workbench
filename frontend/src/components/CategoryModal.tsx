import { useState } from "react";
import type { Category } from "../types";
import { createCategory, deleteCategory } from "../api/client";

interface Props {
  categories: Category[];
  onClose: () => void;
  // 分类发生变化后通知父组件刷新
  onChanged: () => void;
  onToast: (msg: string) => void;
}

const PRESET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
];

export default function CategoryModal({
  categories,
  onClose,
  onChanged,
  onToast,
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      onToast("请填写分类名称");
      return;
    }
    setBusy(true);
    try {
      await createCategory({ name: trimmed, color });
      setName("");
      onChanged();
      onToast("分类已添加");
    } catch (err: any) {
      onToast(err?.response?.data?.detail ?? "添加失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (!window.confirm("删除分类「" + cat.name + "」？该分类下的模板将变为未分类。")) {
      return;
    }
    try {
      await deleteCategory(cat.id);
      onChanged();
      onToast("分类已删除");
    } catch {
      onToast("删除失败");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>分类管理</h2>

        <div className="field">
          <label>新增分类</label>
          <div className="color-row">
            <input
              value={name}
              placeholder="分类名称，如：翻译"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ flex: 1 }}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="选择颜色"
            />
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={busy}
            >
              添加
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {PRESET_COLORS.map((c) => (
              <span
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border:
                    color === c ? "2px solid #1f2430" : "2px solid transparent",
                  transition: "transform 0.15s",
                }}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label>现有分类（{categories.length}）</label>
          {categories.length === 0 && (
            <div style={{ color: "var(--text-soft)", fontSize: 13 }}>
              还没有分类，先添加一个吧。
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {categories.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
              >
                <span
                  className="dot"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: c.color,
                  }}
                />
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ color: "var(--text-soft)", fontSize: 12 }}>
                  {c.template_count} 个模板
                </span>
                <span style={{ flex: 1 }} />
                <button
                  className="btn btn-ghost btn-danger"
                  onClick={() => handleDelete(c)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-primary" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
