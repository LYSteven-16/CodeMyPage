import { registeredComponents, getComponentDef } from './component-registry'
import type { ComponentInstance } from './types'
import type { Workspace } from './types'
import atomEngineSource from '@component-chemistry/atom-engine?raw'

console.log('[Export] atomEngineSource 长度:', atomEngineSource?.length ?? 'undefined')

const CANVAS_WIDTH = 1000

export interface ExportData {
  workspace: Workspace
  components: ComponentInstance[]
  gridSettings: {
    canvasBackground: string
    canvasBorderRadius: number
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function componentToMolecule(comp: ComponentInstance): any {
  const def = getComponentDef(comp.type)
  if (!def) {
    console.warn(`[Export] 未找到组件定义: ${comp.type}, registeredComponents:`, registeredComponents.map(c => c.type))
    return null
  }
  console.log(`[Export] 找到组件定义: ${comp.type}, molecule:`, JSON.stringify(def.molecule).substring(0, 200))

  const molecule = JSON.parse(JSON.stringify(def.molecule))

  molecule.id = comp.id
  molecule.position = { x: comp.x, y: comp.y, z: 1 }
  molecule.width = comp.width || def.defaultWidth
  molecule.height = comp.height || def.defaultHeight

  const props = comp.props || {}

  if (molecule.atoms && Array.isArray(molecule.atoms)) {
    molecule.atoms.forEach((atom: any) => {
      if (atom.capability === 'text') {
        if (props.text !== undefined) atom.text = props.text
        if (props.fontSize !== undefined) atom.size = props.fontSize
        if (props.textColor !== undefined) atom.color = hexToRgb(props.textColor)
        if (props.textX !== undefined || props.textY !== undefined) {
          atom.position = atom.position || { x: 20, y: 20 }
          atom.position.x = props.textX ?? atom.position.x
          atom.position.y = props.textY ?? atom.position.y
        }
        atom.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }

      if (atom.capability === 'background') {
        if (props.backgroundColor !== undefined) atom.color = hexToRgb(props.backgroundColor)
        atom.width = molecule.width
        atom.height = molecule.height
      }

      if (atom.capability === 'border') {
        if (props.borderColor !== undefined) atom.color = hexToRgb(props.borderColor)
        if (props.borderWidth !== undefined) atom.borderWidth = props.borderWidth
        atom.width = molecule.width
        atom.height = molecule.height
      }

      if (atom.capability === 'shadow') {
        if (props.shadowEnabled !== undefined) atom.visible = props.shadowEnabled
        if (props.shadowBlur !== undefined) atom.shadowBlur = props.shadowBlur
        if (props.shadowSpread !== undefined) atom.shadowWidth = props.shadowSpread
        if (props.shadowColor !== undefined) atom.color = hexToRgb(props.shadowColor)
        atom.width = molecule.width
        atom.height = molecule.height
      }

      if (atom.radius !== undefined && props.borderRadius !== undefined) {
        atom.radius = props.borderRadius
      }
    })
  }

  if (props.shadowEnabled !== undefined && molecule.atoms) {
    const shadowAtom = molecule.atoms.find((a: any) => a.capability === 'shadow')
    if (shadowAtom) shadowAtom.visible = props.shadowEnabled
  }

  if (props.borderRadius !== undefined) {
    molecule.radius = props.borderRadius
    if (molecule.atoms) {
      molecule.atoms.forEach((atom: any) => {
        if (atom.radius !== undefined) atom.radius = props.borderRadius
      })
    }
  }

  return molecule
}

export async function generateExportHTML(data: ExportData): Promise<string> {
  console.log('[Export] 开始导出, components:', data.components.length)
  console.log('[Export] registeredComponents:', registeredComponents.map(c => c.type))
  const molecules = data.components.map(c => componentToMolecule(c)).filter(Boolean)
  console.log('[Export] 转换后 molecules:', molecules.length, molecules.map(m => m?.id))
  let engineCode = atomEngineSource
  console.log('[Export] engineCode 长度:', engineCode?.length ?? 'undefined')
  engineCode = engineCode.replace(/export\s*\{[\s\S]*?BeakerManager[\s\S]*?\}\s*;?\s*$/m, 'window.BeakerManager = BeakerManager;')
  console.log('[Export] 替换后 engineCode 末尾300字符:', engineCode?.slice(-300))

  let canvasHeight = 1200
  data.components.forEach(comp => {
    const bottom = (comp.y || 0) + (comp.height || 100)
    if (bottom + 200 > canvasHeight) canvasHeight = bottom + 200
  })

  const moleculesJson = JSON.stringify(molecules, null, 2)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeMyPage Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f7;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
    }
    .canvas {
      width: ${CANVAS_WIDTH}px;
      min-height: ${canvasHeight}px;
      background: ${data.gridSettings.canvasBackground || '#ffffff'};
      border-radius: ${data.gridSettings.canvasBorderRadius || 16}px;
      ${data.workspace.showShadow ? `box-shadow: 0 2px ${data.workspace.shadowBlur ?? 20}px ${data.workspace.shadowSpread ?? 0}px ${data.workspace.shadowColor ?? 'rgba(0,0,0,0.1)'};` : ''}
      position: relative;
      overflow: visible;
    }
  </style>
</head>
<body>
  <div id="canvas" class="canvas"></div>
  <script>
${engineCode}
  </script>
  <script>
    const molecules = ${moleculesJson};
    const canvas = document.getElementById('canvas');
    if (molecules.length > 0) {
      const manager = new BeakerManager(molecules, canvas, {
        position: { x: 0, y: 0 },
        width: ${CANVAS_WIDTH},
        height: ${canvasHeight}
      });
    }
  </script>
</body>
</html>`
}
