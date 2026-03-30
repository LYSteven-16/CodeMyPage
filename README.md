# CodeMyPage

> A visual drag-and-drop web page editor for creating interactive content without coding.

---

## Features

### 🎨 Visual Editor
- **Drag & Drop** - Intuitive component placement with visual feedback
- **Multiple Workspaces** - Create and manage multiple canvas workspaces
- **Grid Snapping** - Automatic alignment to grid for precise positioning
- **Real-time Preview** - See your changes instantly

### 📦 Component Library
- **Test Components** - Pre-built interactive elements
- **Customizable Properties** - Edit text, colors, borders, shadows, and more
- **Component Selection** - Click to select and edit component properties

### 🎯 User Experience
- **Smooth Animations** - Elastic drop animations for better feedback
- **Draggable Panels** - Move component library and property panels anywhere
- **Anti-flicker** - Prevents text selection during drag operations
- **Persistent Layout** - Panel positions are saved and restored

### 💾 Data Management
- **Auto-save** - Save your work to browser storage
- **Export** - Download your project as JSON file
- **Import** - Load previously saved projects
- **Preview** - Open preview in new window

---

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## How to Use

### 1. Create a Workspace
- Click "画布" (Canvas) button in the toolbar
- Click "添加画布" (Add Canvas) to create a new workspace
- Configure workspace name, size, and position

### 2. Add Components
- Click "组件" (Components) button to open the component library
- Drag components from the library to your workspace
- Components will snap to grid if enabled

### 3. Edit Components
- Click on a component to select it
- The property panel will open automatically
- Edit text, colors, borders, shadows, and other properties

### 4. Manage Workspaces
- Click on workspace title to switch between workspaces
- Drag workspace panels to rearrange them
- Each workspace maintains its own components

### 5. Save & Export
- Click "保存" (Save) to save to browser storage
- Click "导出" (Export) to download as JSON file
- Click "加载" (Load) to import a saved project

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click + Drag | Move component |
| Click | Select component |
| Drag Panel Header | Move panel |

---

## Technical Details

### Architecture
- **Pure TypeScript** - No framework dependencies
- **Vanilla DOM** - Direct DOM manipulation for performance
- **CSS Animations** - Smooth transitions and effects
- **Local Storage** - Browser-based data persistence

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Project Structure

```
src/
├── main.ts           # Application entry point
├── app.ts            # Main application logic and UI rendering
├── types.ts          # TypeScript type definitions
├── constants.ts      # Application constants and colors
├── state.ts          # Global state management
├── ui.ts             # UI rendering utilities
├── workspace.ts      # Workspace rendering logic
├── events.ts         # Event handling and interactions
├── test-component.ts # Component definitions
├── preview.ts        # Preview functionality
└── components/
    └── TextComponent.json  # Text component configuration
```

### Architecture Highlights

- **Modular Design** - Code split into focused modules (< 300 lines each)
- **State Management** - Centralized state with setter functions
- **Event System** - Separated event handling logic
- **Type Safety** - Full TypeScript support with interfaces
- **Component Library** - JSON-based component configurations

---

## License

MIT

---

*中文版请参阅 [README_zh.md](README_zh.md)*