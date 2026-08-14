"""数据库引擎、会话与声明式基类。

使用 SQLite 做零配置持久化，数据库文件会在 backend/ 目录下自动创建为 prompts.db。
"""
from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# 数据库文件放在 backend/ 根目录下，随项目一起持久化
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "prompts.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False 允许 FastAPI 在不同线程复用连接
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """所有 ORM 模型的基类。"""


def get_db():
    """FastAPI 依赖：每个请求打开一个会话并在结束后关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
