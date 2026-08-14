"""Pydantic v2 schemas：请求 / 响应模型。"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=60)
    color: str = Field("#6366f1", max_length=20)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=60)
    color: Optional[str] = Field(None, max_length=20)


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    # 该分类下的模板数量（由接口填充）
    template_count: int = 0


# ---------- PromptTemplate ----------
class TemplateBase(BaseModel):
    title: str = Field(..., max_length=150)
    category_id: Optional[int] = None
    content: str = Field("")
    notes: str = Field("")
    favorite: bool = False


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    category_id: Optional[int] = None
    content: Optional[str] = None
    notes: Optional[str] = None
    favorite: Optional[bool] = None


class TemplateOut(TemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    # 冗余分类信息，方便前端直接展示
    category_name: Optional[str] = None
    category_color: Optional[str] = None
