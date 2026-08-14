"""数据库操作层：分类 / 提示词模板。"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from . import models, schemas


# ---------------- 内部工具 ----------------
def _to_template_out(tpl: models.PromptTemplate) -> schemas.TemplateOut:
    out = schemas.TemplateOut.model_validate(tpl)
    out.favorite = bool(tpl.favorite)
    if tpl.category is not None:
        out.category_name = tpl.category.name
        out.category_color = tpl.category.color
    return out


# ---------------- Category ----------------
def list_categories(db: Session) -> list[schemas.CategoryOut]:
    cats = db.execute(select(models.Category).order_by(models.Category.id.asc())).scalars().all()

    # 汇总每个分类下的模板数量
    count_map = dict(
        db.execute(
            select(
                models.PromptTemplate.category_id,
                func.count(models.PromptTemplate.id),
            ).group_by(models.PromptTemplate.category_id)
        ).all()
    )

    result: list[schemas.CategoryOut] = []
    for c in cats:
        out = schemas.CategoryOut.model_validate(c)
        out.template_count = count_map.get(c.id, 0)
        result.append(out)
    return result


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.get(models.Category, category_id)


def get_category_by_name(db: Session, name: str) -> Optional[models.Category]:
    return db.execute(
        select(models.Category).where(models.Category.name == name)
    ).scalars().first()


def create_category(db: Session, payload: schemas.CategoryCreate) -> models.Category:
    cat = models.Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(
    db: Session, cat: models.Category, payload: schemas.CategoryUpdate
) -> models.Category:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, cat: models.Category) -> None:
    # 该分类下的模板转为“未分类”（外键置空）
    db.execute(
        models.PromptTemplate.__table__.update()
        .where(models.PromptTemplate.category_id == cat.id)
        .values(category_id=None)
    )
    db.delete(cat)
    db.commit()


# ---------------- PromptTemplate ----------------
def list_templates(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    favorite: Optional[bool] = None,
) -> list[schemas.TemplateOut]:
    stmt = select(models.PromptTemplate)
    if search:
        like = f"%{search}%"
        # 关键词同时检索标题与正文
        stmt = stmt.where(
            or_(
                models.PromptTemplate.title.ilike(like),
                models.PromptTemplate.content.ilike(like),
            )
        )
    if category_id is not None:
        stmt = stmt.where(models.PromptTemplate.category_id == category_id)
    if favorite is not None:
        stmt = stmt.where(models.PromptTemplate.favorite == (1 if favorite else 0))
    # 收藏优先，其次按更新时间倒序
    stmt = stmt.order_by(
        models.PromptTemplate.favorite.desc(),
        models.PromptTemplate.updated_at.desc(),
    )
    templates = db.execute(stmt).scalars().all()
    return [_to_template_out(t) for t in templates]


def get_template(db: Session, template_id: int) -> Optional[models.PromptTemplate]:
    return db.get(models.PromptTemplate, template_id)


def create_template(db: Session, payload: schemas.TemplateCreate) -> models.PromptTemplate:
    data = payload.model_dump()
    data["favorite"] = 1 if data.get("favorite") else 0
    tpl = models.PromptTemplate(**data)
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl


def update_template(
    db: Session, tpl: models.PromptTemplate, payload: schemas.TemplateUpdate
) -> models.PromptTemplate:
    data = payload.model_dump(exclude_unset=True)
    if "favorite" in data:
        data["favorite"] = 1 if data["favorite"] else 0
    for field, value in data.items():
        setattr(tpl, field, value)
    db.commit()
    db.refresh(tpl)
    return tpl


def delete_template(db: Session, tpl: models.PromptTemplate) -> None:
    db.delete(tpl)
    db.commit()


def toggle_favorite(db: Session, tpl: models.PromptTemplate) -> models.PromptTemplate:
    tpl.favorite = 0 if tpl.favorite else 1
    db.commit()
    db.refresh(tpl)
    return tpl
