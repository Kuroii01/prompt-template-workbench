"""ORM 模型：分类(Category) 与 提示词模板(PromptTemplate)。"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Category(Base):
    """提示词分类，如：代码、文案、绘画、调试。"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(60), nullable=False, unique=True, index=True)
    # 分类主题色，前端据此渲染标签/胶囊
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#6366f1")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    templates: Mapped[list["PromptTemplate"]] = relationship(back_populates="category")


class PromptTemplate(Base):
    """一条提示词模板。"""

    __tablename__ = "prompt_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    # 关联分类，允许为空（未分类）
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    # 提示词正文
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # 用途备注
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # 是否收藏（1/0），标记常用模板
    favorite: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="templates")
