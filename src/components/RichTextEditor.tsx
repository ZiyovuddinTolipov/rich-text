"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Toolbar } from "./Toolbar"
import { HTMLSanitizer } from "../utils/sanitizer"
import type { RichTextEditorProps } from "../types"

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  disabled = false,
  theme = "auto",
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState(value)
  const [isTyping, setIsTyping] = useState(false)
  const lastValueRef = useRef(value)

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || !editorRef.current) return null

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    if (!range) return null

    return {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
    }
  }, [])

  // Restore cursor position
  const restoreCursorPosition = useCallback((position: any) => {
    if (!position || !editorRef.current) return

    try {
      const selection = window.getSelection()
      if (!selection) return

      const range = document.createRange()

      // Check if the nodes still exist in the DOM
      if (editorRef.current.contains(position.startContainer) && editorRef.current.contains(position.endContainer)) {
        range.setStart(position.startContainer, position.startOffset)
        range.setEnd(position.endContainer, position.endOffset)

        selection.removeAllRanges()
        selection.addRange(range)
      }
    } catch (error) {
      // If restoration fails, place cursor at the end
      const selection = window.getSelection()
      if (selection && editorRef.current) {
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [])

  // Initialize editor content only when value changes externally
  useEffect(() => {
    if (editorRef.current && !isHtmlMode && !isTyping && value !== lastValueRef.current) {
      const cursorPosition = saveCursorPosition()
      editorRef.current.innerHTML = value
      lastValueRef.current = value

      // Restore cursor position after a brief delay
      setTimeout(() => {
        if (cursorPosition) {
          restoreCursorPosition(cursorPosition)
        }
      }, 0)
    }
  }, [value, isHtmlMode, isTyping, saveCursorPosition, restoreCursorPosition])

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange && !isHtmlMode) {
      setIsTyping(true)
      const content = editorRef.current.innerHTML
      const sanitized = HTMLSanitizer.sanitize(content)
      lastValueRef.current = sanitized
      onChange(sanitized)

      // Reset typing flag after a short delay
      setTimeout(() => setIsTyping(false), 100)
    }
  }, [onChange, isHtmlMode])

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()

    const clipboardData = e.clipboardData
    const items = clipboardData.items

    // Handle image paste
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = `<img src="${event.target?.result}" style="max-width: 100%; height: auto;" />`
            document.execCommand("insertHTML", false, img)
          }
          reader.readAsDataURL(file)
          return
        }
      }
    }

    // Handle text paste
    const text = clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  // Handle key events to maintain cursor position
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    setIsTyping(true)
  }, [])

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    // Reset typing flag after a delay
    setTimeout(() => setIsTyping(false), 50)
  }, [])

  // Handle image resizing
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG") {
        target.style.resize = "both"
        target.style.overflow = "auto"
        target.contentEditable = "false"
      }
    }

    const editor = editorRef.current
    if (editor) {
      editor.addEventListener("click", handleImageClick)
      return () => editor.removeEventListener("click", handleImageClick)
    }
  }, [])

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switch back to WYSIWYG
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent
        lastValueRef.current = htmlContent
      }
    } else {
      // Switch to HTML mode
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML)
      }
    }
    setIsHtmlMode(!isHtmlMode)
    setIsTyping(false)
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setHtmlContent(content)
    lastValueRef.current = content
    if (onChange) {
      onChange(content)
    }
  }

  return (
    <div
      className={`rich-text-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}
    >
      <Toolbar onSelectionChange={handleInput} />

      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400">{isHtmlMode ? "HTML Source" : "Visual Editor"}</div>
        <button
          onClick={toggleHtmlMode}
          className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {isHtmlMode ? "Visual" : "HTML"}
        </button>
      </div>

      {isHtmlMode ? (
        <textarea
          value={htmlContent}
          onChange={handleHtmlChange}
          className="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 resize-none focus:outline-none"
          disabled={disabled}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className={`
            min-h-[300px] p-4 bg-white dark:bg-gray-900 focus:outline-none
            prose prose-sm max-w-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          style={{
            lineHeight: "1.6",
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
      )}

      <style>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
        }
        
        .rich-text-editor img:hover {
          outline: 2px solid #3b82f6;
        }
        
        .rich-text-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        .rich-text-editor table td,
        .rich-text-editor table th {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
        }
        
        .rich-text-editor table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
        }
        
        .rich-text-editor pre {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          padding: 1em;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .rich-text-editor code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </div>
  )
}
