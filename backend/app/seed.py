"""首次运行时植入示例分类与提示词模板，方便直接体验。"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models

# 默认分类：名称 -> 主题色
DEFAULT_CATEGORIES = [
    ("代码", "#6366f1"),
    ("文案", "#ec4899"),
    ("绘画", "#f59e0b"),
    ("调试", "#10b981"),
]

# 示例模板：(标题, 分类名, 正文, 用途备注, 是否收藏)
DEFAULT_TEMPLATES = [
    (
        "代码审查助手",
        "代码",
        "请以资深工程师的视角审查以下代码，指出潜在 Bug、性能问题与可读性改进点，并给出修改建议：\n\n```\n{在此粘贴代码}\n```",
        "提交 PR 前的自查，快速定位常见问题。",
        True,
    ),
    (
        "单元测试生成",
        "代码",
        "为下面的函数编写完整的单元测试，覆盖正常路径、边界值与异常情况，使用 {测试框架}：\n\n{在此粘贴函数}",
        "补齐测试覆盖率时使用。",
        False,
    ),
    (
        "小红书爆款文案",
        "文案",
        "你是资深小红书运营。请围绕「{主题}」写一篇种草文案，要求：开头有钩子、包含 3 个卖点、结尾引导互动，并配 5 个相关标签。",
        "产品推广、内容运营。",
        True,
    ),
    (
        "二次元插画提示词",
        "绘画",
        "masterpiece, best quality, ultra-detailed, 1girl, {角色描述}, {场景}, cinematic lighting, soft focus, vibrant colors",
        "用于 Stable Diffusion / Midjourney 生成插画。",
        False,
    ),
    (
        "报错排查向导",
        "调试",
        "我遇到如下报错，请分析可能的原因并按可能性从高到低给出排查步骤：\n\n环境：{运行环境}\n报错信息：\n{在此粘贴报错}",
        "线上/本地异常快速定位。",
        False,
    ),
]


def seed_if_empty(db: Session) -> int:
    """当库中没有任何模板时植入示例数据，返回植入的模板数量。"""
    existing = db.execute(select(models.PromptTemplate.id).limit(1)).first()
    if existing is not None:
        return 0

    # 建立分类
    name_to_cat: dict[str, models.Category] = {}
    for name, color in DEFAULT_CATEGORIES:
        cat = db.execute(
            select(models.Category).where(models.Category.name == name)
        ).scalars().first()
        if cat is None:
            cat = models.Category(name=name, color=color)
            db.add(cat)
        name_to_cat[name] = cat
    db.flush()

    # 植入模板
    for title, cat_name, content, notes, favorite in DEFAULT_TEMPLATES:
        db.add(
            models.PromptTemplate(
                title=title,
                category_id=name_to_cat[cat_name].id,
                content=content,
                notes=notes,
                favorite=1 if favorite else 0,
            )
        )
    db.commit()
    return len(DEFAULT_TEMPLATES)
