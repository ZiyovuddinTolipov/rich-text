"use client"

import type React from "react"
import { useRef, useState } from "react"
import { ImageIcon, Upload } from "lucide-react"
import { EditorCommands } from "../utils/commands"

export const ImageHandler: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)

    try {
      // Convert to base64 for demo - in real app, upload to server
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        EditorCommands.insertImage(src, file.name)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Image upload failed:", error)
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageUrl = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      EditorCommands.insertImage(url)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        title="Insert Image"
      >
        {isUploading ? <Upload size={16} className="animate-spin" /> : <ImageIcon size={16} />}
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
