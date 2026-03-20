import React from 'react'
import { createRoot } from 'react-dom/client'
import { ComponentRenderer } from './components/ComponentRenderer'
import type { WidgetProps } from './types'
import './index.css'

interface GridSettings {
  dotSize: number
  dotColor: string
  dotSpacing: number
  snapToGrid: boolean
  canvasBackground: string
  canvasBorderRadius: number
  dotGridBackground: string
}

const CANVAS_WIDTH = 1000
const CANVAS_MIN_HEIGHT = 1600

interface ProjectData {
  components: WidgetProps[]
  gridSettings: GridSettings
  canvasWidth?: number
  title?: string
}

const ExportedApp: React.FC<{ data: ProjectData }> = ({ data }) => {
  const { components, gridSettings } = data

  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...components.map((c) => (c.y || 0) + (c.height || 200) + 200)
  )

  return (
    <div style={{ minHeight: '100vh', background: gridSettings.dotGridBackground }}>
      <div
        className="page-container"
        style={{
          position: 'relative',
          width: CANVAS_WIDTH,
          margin: '0 auto',
          background: gridSettings.canvasBackground,
          minHeight: canvasHeight,
          borderRadius: gridSettings.canvasBorderRadius
        }}
      >
        {components.map((comp) => (
          <ComponentRenderer
            key={comp.id}
            component={comp}
            style={{
              position: 'absolute',
              left: comp.x || 0,
              top: comp.y || 0,
              width: comp.width || 300,
              height: comp.height || 200
            }}
            mode="preview"
          />
        ))}
      </div>
    </div>
  )
}

const data = (window as any).__PROJECT_DATA__ as ProjectData

if (data && data.components) {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)
    root.render(<ExportedApp data={data} />)
  }
}
