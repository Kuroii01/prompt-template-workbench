"""分类路由。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.list_categories(db)


@router.post("", response_model=schemas.CategoryOut, status_code=201)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db)):
    if crud.get_category_by_name(db, payload.name):
        raise HTTPException(status_code=409, detail="分类名称已存在")
    return crud.create_category(db, payload)


@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int, payload: schemas.CategoryUpdate, db: Session = Depends(get_db)
):
    cat = crud.get_category(db, category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="分类不存在")
    # 若改名，校验唯一性
    if payload.name and payload.name != cat.name:
        existing = crud.get_category_by_name(db, payload.name)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=409, detail="分类名称已存在")
    return crud.update_category(db, cat, payload)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = crud.get_category(db, category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="分类不存在")
    crud.delete_category(db, cat)
