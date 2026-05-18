"use client"

import type React from "react"
import { useRef, useState } from "react"
import { ImageIcon, Loader2 } from "lucide-react"
import { EditorCommands } from "../utils/commands"
import { useRichTextEditor } from "../context"

export const ImageHandler: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { onImageUpload } = useRichTextEditor()

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      let src: string
      if (onImageUpload) {
        src = await onImageUpload(file)
      } else {
        src = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
      }
      EditorCommands.insertImage(src, file.name)
    } catch (error) {
      console.error("Image upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      void handleFile(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="rte-dropdown-anchor">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="rte-btn"
        title="Insert Image"
        aria-label="Insert image"
      >
        {isUploading ? <Loader2 size={16} className="rte-spin" /> : <ImageIcon size={16} />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="rte-hidden"
      />
    </div>
  )
}
