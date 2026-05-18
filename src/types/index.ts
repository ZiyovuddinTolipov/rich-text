import type React from "react"

export type Theme = "light" | "dark" | "auto"

export type BuiltInToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "sub"
  | "sup"
  | "heading"
  | "paragraph"
  | "ul"
  | "ol"
  | "checklist"
  | "quote"
  | "code"
  | "codeblock"
  | "hr"
  | "link"
  | "unlink"
  | "image"
  | "table"
  | "colorText"
  | "colorBg"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify"
  | "indent"
  | "outdent"
  | "undo"
  | "redo"
  | "clear"
  | "html"
  | "fontFamily"
  | "fontSize"
  | "|"

export interface ToolbarButtonConfig {
  id: string
  title: string
  icon: React.ReactNode
  onClick: () => void
  isActive?: boolean
}

export type ToolbarItem = BuiltInToolbarItem | ToolbarButtonConfig
export type ToolbarPreset = "all" | "minimal" | "basic"

export interface SlashCommand {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  keywords?: string[]
  run: (editor: HTMLElement) => void
}

export type BubbleItem =
  | "bold" | "italic" | "underline" | "strike" | "code"
  | "h1" | "h2" | "h3"
  | "link" | "unlink"
  | "quote"
  | "|"

export interface EditorStats {
  characters: number
  charactersNoSpaces: number
  words: number
}

export interface RichTextEditorHandle {
  focus(): void
  blur(): void
  clear(): void
  getHTML(): string
  setHTML(html: string): void
  getText(): string
  insertHTML(html: string): void
  execCommand(command: string, value?: string): void
  getStats(): EditorStats
  /** Returns true when current content differs from the value set via `value` prop or `markClean()`. */
  isDirty(): boolean
  /** Treat the current content as the new "clean" baseline. */
  markClean(): void
  /** Open the find-and-replace popup (no-op when `findReplace` prop is false). */
  openFindReplace(): void
  /** Close the find-and-replace popup. */
  closeFindReplace(): void
}

export interface RichTextEditorProps {
  /** Controlled HTML content. */
  value?: string
  /** Fired on every (sanitized) change. */
  onChange?: (html: string) => void
  /** Placeholder shown when the editor is empty. */
  placeholder?: string
  /** Extra class names applied to the root container. */
  className?: string
  /** Inline style applied to the root container. */
  style?: React.CSSProperties
  /** Disable the editor (greys out the surface). */
  disabled?: boolean
  /** Render the editor without an editable surface. Toolbar still visible. */
  readOnly?: boolean
  /** Visual theme. "auto" follows the OS preference via prefers-color-scheme. */
  theme?: Theme
  /**
   * Which toolbar items to show — a preset, an array of built-in IDs,
   * or full custom button configs. Separators use `"|"`.
   */
  toolbar?: ToolbarPreset | ToolbarItem[]
  /** Additional custom buttons appended to the toolbar. */
  customButtons?: ToolbarButtonConfig[]
  /** Async image upload handler. Return the final image URL. Falls back to base64 when omitted. */
  onImageUpload?: (file: File) => Promise<string>
  /** Auto-focus the editor on mount. */
  autoFocus?: boolean
  /** Hard cap on character count. Edits beyond this are rejected. */
  maxLength?: number
  /** Default text/background color presets shown in the color pickers. */
  textColorPresets?: string[]
  backgroundColorPresets?: string[]
  /** Optional minimum height of the editing surface (CSS value). */
  minHeight?: string
  /** Show word/character counter under the editor. */
  showStats?: boolean
  /** Allow switching to raw HTML view. Default: true. */
  allowHtmlMode?: boolean
  /** Standard React lifecycle handlers. */
  onFocus?: () => void
  onBlur?: () => void
  onSelectionChange?: () => void
  /**
   * Enable Notion-style slash command menu. `true` uses defaults; pass an array
   * of `SlashCommand` to provide custom commands.
   */
  slashMenu?: boolean | SlashCommand[]
  /**
   * Enable typing markdown shortcuts (`**bold**`, `# heading`, `- list`, etc.).
   * Default: false.
   */
  markdownShortcuts?: boolean
  /**
   * Show a floating toolbar above the current text selection.
   * `true` shows defaults; pass an array of `BubbleItem` to customize.
   */
  bubbleToolbar?: boolean | BubbleItem[]
  /**
   * Enable the Find & Replace popup (Ctrl/Cmd+F to open).
   * Default: false.
   */
  findReplace?: boolean
  /**
   * Autosave configuration. When provided, `onSave` fires after the editor has
   * been quiet for `interval` ms (default 1500 ms).
   */
  autosave?: AutosaveConfig
  /**
   * Clean up pasted HTML from Microsoft Word and Google Docs (strip MSO classes,
   * conditional comments, and other clutter). Default: true.
   */
  cleanPaste?: boolean
  /**
   * Show drag handles on selected images so the user can resize them inline.
   * Default: false.
   */
  imageResize?: boolean
  /** Fired after autosave actually runs (after the debounce). */
  onAutosave?: (html: string) => void
  /** Fired when dirty state flips (true ↔ false). */
  onDirtyChange?: (isDirty: boolean) => void
}

export interface AutosaveConfig {
  /** Debounce window in ms. Default 1500. */
  interval?: number
  /** Save callback. Awaited if it returns a promise. */
  onSave: (html: string) => void | Promise<void>
  /** Optional error handler. Defaults to `console.error`. */
  onError?: (err: unknown) => void
}

export interface ToolbarButtonProps {
  command?: string
  icon: React.ReactNode
  title: string
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
}

export interface ImageData {
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface TableData {
  rows: number
  cols: number
}

export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  type: "text" | "background"
  presets?: string[]
}

export interface SanitizeOptions {
  /** Allow inline `style` attribute. Default false (recommended for security). */
  allowStyle?: boolean
  /** Additional tag names to allow. */
  extraTags?: string[]
  /** Additional attribute names to allow. */
  extraAttributes?: string[]
}
