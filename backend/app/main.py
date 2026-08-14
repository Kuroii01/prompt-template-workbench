"""应用入口：创建表、植入种子、挂载路由、配置 CORS。"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import categories, templates
from .seed import seed_if_empty

app = FastAPI(title="AI Prompt 模板管理工作台 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # 建表 + 首次植入示例数据
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        n = seed_if_empty(db)
        if n:
            print(f"[seed] 已植入 {n} 条示例提示词模板")
    finally:
        db.close()


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "service": "prompt-template-workbench"}


app.include_router(categories.router)
app.include_router(templates.router)
