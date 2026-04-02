import type { ComponentProps } from './types'

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function applyAtomProps(atom: any, props: ComponentProps, moleculeWidth: number, moleculeHeight: number): void {
  switch (atom.capability) {
    case 'text':
      if (props.text !== undefined) atom.text = props.text
      if (props.fontSize !== undefined) atom.size = props.fontSize
      if (props.textColor !== undefined) atom.color = hexToRgb(props.textColor)
      if (props.textX !== undefined || props.textY !== undefined) {
        atom.position = atom.position || { x: 20, y: 20 }
        atom.position.x = props.textX ?? atom.position.x
        atom.position.y = props.textY ?? atom.position.y
      }
      atom.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      break

    case 'background':
      if (props.backgroundColor !== undefined) atom.color = hexToRgb(props.backgroundColor)
      if (props.opacity !== undefined) atom.opacity = props.opacity
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'border':
      if (props.borderColor !== undefined) atom.color = hexToRgb(props.borderColor)
      if (props.borderWidth !== undefined) atom.borderWidth = props.borderWidth
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'shadow':
      if (props.shadowEnabled !== undefined) atom.visible = props.shadowEnabled
      if (props.shadowBlur !== undefined) atom.shadowBlur = props.shadowBlur
      if (props.shadowSpread !== undefined) atom.shadowWidth = props.shadowSpread
      if (props.shadowColor !== undefined) atom.color = hexToRgb(props.shadowColor)
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'video':
      if (props.videoUrl !== undefined) atom.src = props.videoUrl
      if (props.autoplay !== undefined) atom.autoplay = props.autoplay
      if (props.loop !== undefined) atom.loop = props.loop
      if (props.muted !== undefined) atom.muted = props.muted
      if (props.controls !== undefined) atom.controls = props.controls
      if (props.borderRadius !== undefined) atom.radius = props.borderRadius
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'canvas':
      if (props.strokeColor !== undefined) atom.strokeColor = hexToRgb(props.strokeColor)
      if (props.strokeWidth !== undefined) atom.strokeWidth = props.strokeWidth
      if (props.backgroundColor !== undefined) atom.backgroundColor = hexToRgb(props.backgroundColor)
      if (props.blackboardStyle !== undefined) atom.blackboardStyle = props.blackboardStyle
      if (props.showToolbar !== undefined) atom.showToolbar = props.showToolbar
      if (props.resizable !== undefined) atom.resizable = props.resizable
      atom.width = moleculeWidth - 20
      atom.height = moleculeHeight - 40
      break

    case 'audio':
      if (props.audioUrl !== undefined) atom.src = props.audioUrl
      if (props.autoplay !== undefined) atom.autoplay = props.autoplay
      if (props.loop !== undefined) atom.loop = props.loop
      if (props.muted !== undefined) atom.muted = props.muted
      break

    case 'image':
      if (props.imageUrl !== undefined) atom.src = props.imageUrl
      if (props.imageAlt !== undefined) atom.alt = props.imageAlt
      if (props.imageFitMode !== undefined) atom.fitMode = props.imageFitMode
      break

    case 'code':
      if (props.code !== undefined) atom.code = props.code
      if (props.codeLanguage !== undefined) atom.language = props.codeLanguage
      if (props.codeBackgroundColor !== undefined) atom.backgroundColor = hexToRgb(props.codeBackgroundColor)
      break

    case 'icon':
      if (props.icon !== undefined) atom.icon = props.icon
      if (props.iconSvg !== undefined) atom.svg = props.iconSvg
      if (props.iconSize !== undefined) atom.size = props.iconSize
      if (props.iconColor !== undefined) atom.color = hexToRgb(props.iconColor)
      break

    case 'checkbox':
      if (props.checkboxChecked !== undefined) atom.checked = props.checkboxChecked
      if (props.checkboxLabel !== undefined) atom.label = props.checkboxLabel
      if (props.checkboxSize !== undefined) atom.size = props.checkboxSize
      if (props.checkboxColor !== undefined) atom.color = hexToRgb(props.checkboxColor)
      break

    case 'input':
      if (props.inputValue !== undefined) atom.value = props.inputValue
      if (props.inputPlaceholder !== undefined) atom.placeholder = props.inputPlaceholder
      if (props.inputSize !== undefined) atom.size = props.inputSize
      if (props.inputColor !== undefined) atom.color = hexToRgb(props.inputColor)
      if (props.inputWidth !== undefined) atom.width = props.inputWidth
      if (props.inputHeight !== undefined) atom.height = props.inputHeight
      break

    case 'select':
      if (props.selectValue !== undefined) atom.value = props.selectValue
      if (props.selectOptions !== undefined) atom.options = props.selectOptions
      break

    case 'textarea':
      if (props.textareaValue !== undefined) atom.value = props.textareaValue
      if (props.textareaPlaceholder !== undefined) atom.placeholder = props.textareaPlaceholder
      if (props.textareaSize !== undefined) atom.size = props.textareaSize
      if (props.textareaColor !== undefined) atom.color = hexToRgb(props.textareaColor)
      if (props.textareaRows !== undefined) atom.rows = props.textareaRows
      break

    case 'editable-text':
      if (props.editableText !== undefined) atom.text = props.editableText
      if (props.editableTextSize !== undefined) atom.size = props.editableTextSize
      if (props.editableTextColor !== undefined) atom.color = hexToRgb(props.editableTextColor)
      if (props.editableTextEditable !== undefined) atom.editable = props.editableTextEditable
      break

    case 'flex':
      if (props.flexDirection !== undefined) atom.direction = props.flexDirection
      if (props.flexGap !== undefined) atom.gap = props.flexGap
      if (props.flexAlign !== undefined) atom.align = props.flexAlign
      if (props.flexJustify !== undefined) atom.justify = props.flexJustify
      if (props.flexWrap !== undefined) atom.wrap = props.flexWrap
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'scroll-container':
      if (props.scrollDirection !== undefined) atom.direction = props.scrollDirection
      atom.width = moleculeWidth
      atom.height = moleculeHeight
      break

    case 'collapse':
      if (props.collapseExpandedValue !== undefined) atom.expandedValue = props.collapseExpandedValue
      if (props.collapseCollapsedValue !== undefined) atom.collapsedValue = props.collapseCollapsedValue
      break

    case 'opacity':
      if (props.opacityValue !== undefined) atom.value = props.opacityValue
      if (props.opacityDefaultValue !== undefined) atom.defaultValue = props.opacityDefaultValue
      if (props.opacityDuration !== undefined) atom.duration = props.opacityDuration
      break

    case 'scale':
      if (props.scaleValue !== undefined) atom.value = props.scaleValue
      if (props.scaleDefaultValue !== undefined) atom.defaultValue = props.scaleDefaultValue
      if (props.scaleDuration !== undefined) atom.duration = props.scaleDuration
      break

    case 'rotate':
      if (props.rotateValue !== undefined) atom.value = props.rotateValue
      if (props.rotateDefaultValue !== undefined) atom.defaultValue = props.rotateDefaultValue
      if (props.rotateDuration !== undefined) atom.duration = props.rotateDuration
      break

    case 'width':
      if (props.widthCollapsedValue !== undefined) atom.collapsedValue = props.widthCollapsedValue
      if (props.widthTrigger !== undefined) atom.trigger = props.widthTrigger
      if (props.widthDuration !== undefined) atom.duration = props.widthDuration
      break

    case 'height':
      if (props.heightCollapsedValue !== undefined) atom.collapsedValue = props.heightCollapsedValue
      if (props.heightTrigger !== undefined) atom.trigger = props.heightTrigger
      if (props.heightDuration !== undefined) atom.duration = props.heightDuration
      break
  }
}
