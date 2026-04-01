---
name: commit
description: Git Commit 辅助 — 规范的 commit 流程
tools: [bash]
---

# Commit 技能 — Git 提交辅助

当用户说"commit""提交""做个提交""git 提交"时触发。

## 执行步骤

### 第一步：查看当前状态

并行执行：
```bash
git status
git diff
git log --oneline -5
```

### 第二步：分析变更

1. 确认有哪些文件变更（新增/修改/删除）
2. 排除不需要提交的文件：
   - `.env`、`.env.local` 等配置文件
   - `node_modules/`
   - 构建产物（`dist/`、`build/`、`*.js` 如果有 .gitignore）
   - `package-lock.json`（除非明确需要）

### 第三步：编写 Commit Message

格式：
```
<类型>: <简短描述>

<可选的详细说明>
```

类型可选：
- `feat:` 新功能
- `fix:` 修复 bug
- `refactor:` 重构（不改变功能）
- `style:` 格式调整
- `docs:` 文档更新
- `test:` 测试相关
- `chore:` 杂项（依赖更新、构建配置等）

示例：
```
feat: 添加拖拽排序功能

- 实现组件拖拽排序
- 支持撤销操作
- 修复拖拽时状态不同步的问题
```

### 第四步：执行提交

```bash
git add <具体文件>
git commit -m "feat: 添加拖拽排序功能"
git status
```

### 常见问题

**有 .env 或敏感文件被修改：**
→ 先 stash 或 restore，再单独 add 需要的文件

**没有变更：**
→ 告知用户没有检测到变更，不需要 commit

**Commit 前有 pre-commit hook 失败：**
→ 修复问题，不要用 `--no-verify`，然后重新 commit

## 注意
- Commit Message 用中文写，简洁明了
- 一个 commit 只做一件事
- 先问用户确认 commit message 再执行
