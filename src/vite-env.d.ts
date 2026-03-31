/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: <T = any>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ) => Record<string, () => Promise<T>>
}