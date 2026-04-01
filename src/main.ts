import { renderUI } from './app'
import { restoreState } from './persistence'
import { registerComponents } from './component-registry'

registerComponents()
restoreState()

renderUI()
