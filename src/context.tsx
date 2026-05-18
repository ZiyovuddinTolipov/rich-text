import { createContext, useContext } from "react"

export interface RichTextEditorContextValue {
  onImageUpload?: (file: File) => Promise<string>
  readOnly: boolean
  disabled: boolean
  registerHistorySnapshot?: () => void
}

export const RichTextEditorContext = createContext<RichTextEditorContextValue>({
  readOnly: false,
  disabled: false,
})

export const useRichTextEditor = () => useContext(RichTextEditorContext)
