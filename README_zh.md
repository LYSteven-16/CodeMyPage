# CodeMyPage

> 一款可视化拖拽式网页编辑器，无需编程即可创建互动内容。

---

## 功能特性

### 🎨 可视化编辑器
- **拖拽操作** - 直观的组件放置，带视觉反馈
- **多工作区** - 创建和管理多个画布工作区
- **网格吸附** - 自动对齐网格，精确定位
- **实时预览** - 即时查看更改效果

### 📦 组件系统
- **JSON 组件配置** - 使用 AtomEngine molecule 格式定义组件
- **自动注册** - 从 `src/components/*.json` 自动扫描注册
- **可定制属性** - 编辑文本、颜色、边框、阴影、尺寸、位置等
- **实时更新** - 所有属性修改即时反映在画布上

### 🎯 可编辑的组件属性
- **文本属性** - 文字内容、颜色、字体大小、位置 (X/Y)
- **尺寸属性** - 组件宽度和高度
- **外观属性** - 背景颜色、边框颜色/宽度、圆角
- **阴影属性** - 启用/禁用、模糊、扩展、颜色

### 🎯 用户体验
- **流畅动画** - 弹性放置动画，提供更好的反馈
- **可拖动面板** - 随意移动组件库和属性面板
- **防闪烁** - 拖拽时防止文字被选中
- **持久化布局** - 面板位置保存并恢复

### 💾 数据管理
- **自动保存** - 保存到浏览器存储
- **导出** - 下载项目为 JSON 文件
- **导入** - 加载之前保存的项目
- **预览** - 在新窗口打开预览

---

## 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

---

## 使用指南

### 1. 创建工作区
- 点击工具栏中的"画布"按钮
- 点击"添加画布"创建新工作区
- 配置工作区名称、大小和位置

### 2. 添加组件
- 点击"组件"按钮打开组件库
- 从库中拖拽组件到工作区
- 如果启用，组件将自动吸附到网格

### 3. 编辑组件
- 点击组件进行选择
- 属性面板将自动打开
- 实时编辑以下属性：
  - **尺寸**：宽度和高度
  - **文本**：内容、颜色、字体大小、位置 (X/Y)
  - **外观**：背景颜色、边框颜色/宽度、圆角
  - **阴影**：启用/禁用、模糊、扩展、颜色

### 4. 管理工作区
- 点击工作区标题切换工作区
- 拖拽工作区面板重新排列
- 每个工作区维护自己的组件

### 5. 保存与导出
- 点击"保存"保存到浏览器存储
- 点击"导出"下载为 JSON 文件
- 点击"加载"导入已保存的项目

---

## 快捷键

| 快捷键 | 操作 |
|--------|------|
| ⌘S / Ctrl+S | 保存项目 |
| ⌘B / Ctrl+B | 切换侧边栏 |
| Delete / Backspace | 删除选中组件 |
| 点击 + 拖拽 | 移动组件 |
| 点击 | 选择组件 |
| 拖拽面板标题 | 移动面板 |

---

## 技术细节

### 架构
- **纯 TypeScript** - 无框架依赖
- **原生 DOM** - 直接 DOM 操作，性能优异
- **AtomEngine 集成** - 使用 `@component-chemistry/atom-engine` 渲染分子
- **CSS 动画** - 平滑过渡和效果
- **本地存储** - 基于浏览器的数据持久化

### 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── app.ts                  # 主应用逻辑、UI 渲染和属性编辑器
├── types.ts                # TypeScript 类型定义 (GridSettings, Workspace, ComponentProps 等)
├── constants.ts            # 应用常量和颜色配置
├── state.ts                # 全局状态管理 (组件、工作区、UI 面板)
├── ui.ts                   # UI 渲染工具和下拉组件
├── workspace.ts            # 工作区渲染逻辑
├── events.ts               # 事件处理和交互逻辑
├── component-registry.ts    # 组件注册和渲染 (AtomEngine 集成)
├── preview.ts              # 预览功能
└── components/             # 组件 JSON 配置
    └── TextComponent.json   # 文本组件配置
```

### 核心模块

- **component-registry.ts** - 扫描 `src/components/*.json`，注册组件，使用 AtomEngine BeakerManager 渲染
- **state.ts** - 集中式状态管理，包含组件、工作区、网格设置的 getter/setter
- **events.ts** - 绑定 UI 事件，处理拖拽、属性编辑、工作区管理
- **workspace.ts** - 将工作区和组件渲染到 DOM

### 组件系统

组件使用 JSON 格式定义，结构如下：

```json
{
  "type": "component-type",
  "name": "组件名称",
  "icon": "📦",
  "defaultWidth": 200,
  "defaultHeight": 60,
  "molecule": {
    "id": "",
    "position": { "x": 0, "y": 0 },
    "atoms": [
      {
        "id": "",
        "capability": "shadow",
        "position": { "x": 0, "y": 0, "z": 0 },
        "width": 200,
        "height": 60,
        "radius": 8
      },
      {
        "id": "",
        "capability": "background",
        "position": { "x": 0, "y": 0, "z": 0.1 },
        "width": 200,
        "height": 60,
        "radius": 8
      },
      {
        "id": "",
        "capability": "border",
        "borderWidth": 1,
        "position": { "x": 0, "y": 0, "z": 0.5 },
        "width": 200,
        "height": 60,
        "radius": 8
      },
      {
        "id": "",
        "capability": "text",
        "text": "你好！",
        "position": { "x": 20, "y": 20, "z": 1 },
        "size": 18
      }
    ],
    "width": 200,
    "height": 60,
    "radius": 8
  }
}
```

**原子能力 (Atom Capabilities)：**
- `shadow` - 阴影效果，支持模糊、扩展、颜色、可见性
- `background` - 背景填充，支持颜色
- `border` - 边框，支持颜色和宽度
- `text` - 文本内容，支持位置、大小、颜色、字重

**添加新组件：**
只需在 `src/components/` 目录下添加新的 `.json` 文件。组件会在应用启动时自动注册。

---

## 许可证

MIT

---

*For English version, see [README.md](README.md)*
