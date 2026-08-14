"""提示词模板路由。"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[schemas.TemplateOut])
def list_templates(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    favorite: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return crud.list_templates(
        db, search=search, category_id=category_id, favorite=favorite
    )


@router.get("/{template_id}", response_model=schemas.TemplateOut)
def get_template(template_id: int, db: Session = Depends(get_db)):
    tpl = crud.get_template(db, template_id)
    if tpl is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    return crud._to_template_out(tpl)


@router.post("", response_model=schemas.TemplateOut, status_code=201)
def create_template(payload: schemas.TemplateCreate, db: Session = Depends(get_db)):
    if payload.category_id is not None and crud.get_category(db, payload.category_id) is None:
        raise HTTPException(status_code=400, detail="指定的分类不存在")
    tpl = crud.create_template(db, payload)
    return crud._to_template_out(tpl)


@router.put("/{template_id}", response_model=schemas.TemplateOut)
def update_template(
    template_id: int, payload: schemas.TemplateUpdate, db: Session = Depends(get_db)
):
    tpl = crud.get_template(db, template_id)
    if tpl is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    if payload.category_id is not None and crud.get_category(db, payload.category_id) is None:
        raise HTTPException(status_code=400, detail="指定的分类不存在")
    tpl = crud.update_template(db, tpl, payload)
    return crud._to_template_out(tpl)


@router.patch("/{template_id}/favorite", response_model=schemas.TemplateOut)
def toggle_favorite(template_id: int, db: Session = Depends(get_db)):
    tpl = crud.get_template(db, template_id)
    if tpl is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    tpl = crud.toggle_favorite(db, tpl)
    return crud._to_template_out(tpl)


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    tpl = crud.get_template(db, template_id)
    if tpl is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    crud.delete_template(db, tpl)
