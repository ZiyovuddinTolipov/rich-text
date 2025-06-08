import type React from "react"
export interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  apiKey?: string
  theme?: "light" | "dark" | "auto"
}

export interface ToolbarButtonProps {
  command: string
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
}
