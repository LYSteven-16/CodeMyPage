// ==================== 组件注册中心 ====================
// 启动时自动扫描 src/components/*.json，注册所有可用组件
// 新增组件只需放入 components/ 目录，无需修改任何代码

import { BeakerManager } from '@component-chemistry/atom-engine';
import type { ComponentInstance, ComponentProps } from './types'

// 组件元数据（从 JSON 外层读取）
export interface ComponentMeta {
  type: string
  name: string
  icon: string
  defaultWidth: number
  defaultHeight: number
  molecule: any
  filePath: string
}

// 已注册的组件列表
export let registeredComponents: ComponentMeta[] = [];

// ==================== 自动扫描注册 ====================
export function registerComponents() {
  registeredComponents = [];
  
  // 手动导入 components 目录下的所有 JSON
  // Vite 支持 import.meta.glob 动态导入
  const modules = import.meta.glob('./components/*.json', { eager: true }) as Record<string, any>;
  
  for (const path in modules) {
    const mod = modules[path];
    if (mod && mod.type && mod.molecule) {
      registeredComponents.push({
        type: mod.type,
        name: mod.name || mod.type,
        icon: mod.icon || '📦',
        defaultWidth: mod.defaultWidth || 150,
        defaultHeight: mod.defaultHeight || 100,
        molecule: mod.molecule,
        filePath: path
      });
    }
  }
  
  console.log('[ComponentRegistry] 已注册组件:', registeredComponents.map(c => c.name).join(', '));
}

// ==================== 获取组件定义 ====================
export function getComponentDef(type: string): ComponentMeta | undefined {
  return registeredComponents.find(c => c.type === type);
}

// ==================== 渲染组件快照 ====================
// 使用 AtomEngine 渲染视觉快照，返回 DOM 元素
// 注意：BeakerManager 的 Molecule 类型定义需要从 atom-engine 包导入
export function renderComponentSnapshot(
  type: string,
  x: number,
  y: number,
  container: HTMLElement,
  width: number,
  height: number,
  props?: ComponentProps,
  id?: string
): HTMLElement | null {
  const def = getComponentDef(type);
  if (!def) {
    console.warn(`[ComponentRegistry] 未找到组件类型: ${type}`);
    return null;
  }
  
  try {
    // 克隆 molecule 数据，避免污染原始定义
    const moleculeData = JSON.parse(JSON.stringify(def.molecule));
    moleculeData.position = { x: 0, y: 0 };
    // 设置组件 ID，用于事件绑定
    if (id) {
      moleculeData.id = id;
    }
    
    // 辅助函数：将 hex 颜色转换为 RGB 数组
    const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace('#', '');
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16)
      ];
    };
    
    // 应用所有用户修改的属性
    if (props && Array.isArray(moleculeData.atoms)) {
      moleculeData.atoms.forEach((atom: any) => {
        // 文本原子
        if (atom.capability === 'text') {
          if (props.text !== undefined) {
            atom.text = props.text;
          }
          if (props.fontSize !== undefined) {
            atom.size = props.fontSize;
          }
          if (props.textColor !== undefined) {
            atom.color = hexToRgb(props.textColor);
          }
          if (props.textX !== undefined || props.textY !== undefined) {
            atom.position.x = props.textX ?? atom.position?.x ?? 20;
            atom.position.y = props.textY ?? atom.position?.y ?? 20;
          }
          atom.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        }
        
        // 背景原子
        if (atom.capability === 'background') {
          if (props.backgroundColor !== undefined) {
            atom.color = hexToRgb(props.backgroundColor);
          }
          atom.width = width;
          atom.height = height;
        }
        
        // 边框原子
        if (atom.capability === 'border') {
          if (props.borderColor !== undefined) {
            atom.color = hexToRgb(props.borderColor);
          }
          if (props.borderWidth !== undefined) {
            atom.borderWidth = props.borderWidth;
          }
          atom.width = width;
          atom.height = height;
        }
        
        // 阴影原子
        if (atom.capability === 'shadow') {
          if (props.shadowEnabled !== undefined) {
            atom.visible = props.shadowEnabled;
          }
          if (props.shadowBlur !== undefined) {
            atom.shadowBlur = props.shadowBlur;
          }
          if (props.shadowSpread !== undefined) {
            atom.shadowWidth = props.shadowSpread;
          }
          if (props.shadowColor !== undefined) {
            atom.color = hexToRgb(props.shadowColor);
          }
          atom.width = width;
          atom.height = height;
        }
        
        // 圆角
        if (atom.radius !== undefined && props.borderRadius !== undefined) {
          atom.radius = props.borderRadius;
        }
      });
    }
    
    // 处理阴影显示/隐藏
    if (props?.shadowEnabled !== undefined && moleculeData.atoms) {
      const shadowAtom = moleculeData.atoms.find((a: any) => a.capability === 'shadow');
      if (shadowAtom) {
        shadowAtom.visible = props.shadowEnabled;
      }
    }
    
    // 处理圆角
    if (props?.borderRadius !== undefined) {
      moleculeData.radius = props.borderRadius;
      if (moleculeData.atoms) {
        moleculeData.atoms.forEach((atom: any) => {
          if (atom.radius !== undefined) {
            atom.radius = props.borderRadius;
          }
        });
      }
    }
    
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = `${x}px`;
    tempContainer.style.top = `${y}px`;
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;
    tempContainer.style.pointerEvents = 'none';
    
    // 使用 BeakerManager 渲染
    const manager = new BeakerManager([moleculeData], tempContainer, {
      position: { x: 0, y: 0 },
      width: width,
      height: height
    });
    
    const baker = manager.getBaker('baker-0');
    if (baker) {
      const element = baker.element;
      element.style.position = 'absolute';
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      // Workspace 内组件需要可命中，才能触发选中与拖拽事件
      element.style.pointerEvents = 'auto';
      // 设置 data-id 属性，用于组件选择和事件绑定
      if (id) {
        element.dataset.id = id;
      }
      container.appendChild(element);
      return element;
    }
    
    // fallback：返回临时容器
    container.appendChild(tempContainer);
    return tempContainer;
  } catch (e) {
    console.error(`[ComponentRegistry] 渲染组件失败: ${type}`, e);
    return null;
  }
}

// ==================== 创建组件实例数据 ====================
export function createComponentInstance(
  type: string,
  workspaceId: string,
  x: number,
  y: number
): ComponentInstance | null {
  const def = getComponentDef(type);
  if (!def) return null;
  
  return {
    id: `${workspaceId}-component-${Date.now()}`,
    type,
    x,
    y,
    width: def.defaultWidth,
    height: def.defaultHeight,
    selected: false,
    props: {},
    moleculeData: JSON.parse(JSON.stringify(def.molecule))
  };
}

// ==================== 渲染组件到 workspace（用于 workspace 更新） ====================
// 与 renderComponentSnapshot 不同，这里用于在 workspace 中渲染已存在的实例
export function renderComponentToWorkspace(
  instance: ComponentInstance,
  container: HTMLElement
): HTMLElement | null {
  return renderComponentSnapshot(instance.type, instance.x, instance.y, container, instance.width, instance.height, instance.props, instance.id);
}

// 初始化注册
registerComponents();

// ==================== 获取组件菜单项 ====================
// 用于组件库菜单动态生成
export function getComponentMenuItems() {
  return registeredComponents.map(comp => ({
    type: comp.type,
    name: comp.name,
    icon: comp.icon,
    defaultWidth: comp.defaultWidth,
    defaultHeight: comp.defaultHeight
  }));
}
