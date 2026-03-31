# CodeMyPage

> A visual drag-and-drop web page editor for creating interactive content without coding.

---

## Features

### 🎨 Visual Editor
- **Drag & Drop** - Intuitive component placement with visual feedback
- **Multiple Workspaces** - Create and manage multiple canvas workspaces
- **Grid Snapping** - Automatic alignment to grid for precise positioning
- **Real-time Preview** - See your changes instantly

### 📦 Component System
- **JSON-based Components** - Components defined in JSON format with AtomEngine molecules
- **Auto Registration** - Components automatically registered from `src/components/*.json`
- **Customizable Properties** - Edit text, colors, borders, shadows, dimensions, positions, and more
- **Real-time Updates** - All property changes reflect instantly on the canvas

### 🎯 Editable Component Properties
- **Text Properties** - Text content, color, font size, position (X/Y)
- **Size Properties** - Component width and height
- **Appearance Properties** - Background color, border color/width, border radius
- **Shadow Properties** - Enable/disable, blur, spread, color

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
- Edit the following properties in real-time:
  - **Size**: Width and height
  - **Text**: Content, color, font size, position (X/Y)
  - **Appearance**: Background color, border color/width, border radius
  - **Shadow**: Enable/disable, blur, spread, color

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
| ⌘S / Ctrl+S | Save project |
| ⌘B / Ctrl+B | Toggle sidebar |
| Delete / Backspace | Delete selected component |
| Click + Drag | Move component |
| Click | Select component |
| Drag Panel Header | Move panel |

---

## Technical Details

### Architecture
- **Pure TypeScript** - No framework dependencies
- **Vanilla DOM** - Direct DOM manipulation for performance
- **AtomEngine Integration** - Uses `@component-chemistry/atom-engine` for molecule rendering
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
├── main.ts                 # Application entry point
├── app.ts                  # Main application logic, UI rendering, and property editor
├── types.ts                # TypeScript type definitions (GridSettings, Workspace, ComponentProps, etc.)
├── constants.ts            # Application constants and color palette
├── state.ts                # Global state management (components, workspaces, UI panels)
├── ui.ts                   # UI rendering utilities and dropdown components
├── workspace.ts            # Workspace rendering logic
├── events.ts               # Event handling and interactions
├── component-registry.ts    # Component registration and rendering (AtomEngine integration)
├── preview.ts               # Preview functionality
└── components/              # Component JSON configurations
    └── TextComponent.json   # Text component with molecule definition
```

### Key Modules

- **component-registry.ts** - Scans `src/components/*.json`, registers components, renders using AtomEngine BeakerManager
- **state.ts** - Centralized state with getter/setter functions for components, workspaces, grid settings
- **events.ts** - Binds UI events, handles drag-drop, property editing, workspace management
- **workspace.ts** - Renders workspaces and their components to the DOM

### Component System

Components are defined in JSON format with the following structure:

```json
{
  "type": "component-type",
  "name": "Component Name",
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
        "text": "Hello!",
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

**Atom Capabilities:**
- `shadow` - Shadow effect with blur, spread, color, visibility
- `background` - Background fill with color
- `border` - Border with color and width
- `text` - Text content with position, size, color, font weight

**Add New Components:**
Simply add a new `.json` file in `src/components/` directory. The component will be automatically registered on application startup.

---

## License

MIT

---

*中文版请参阅 [README_zh.md](README_zh.md)*
