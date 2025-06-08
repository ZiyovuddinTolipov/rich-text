"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, Unlink } from "lucide-react"
import { EditorCommands } from "../utils/commands"

export const LinkManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInsertLink = () => {
    if (url) {
      EditorCommands.createLink(url, text)
      setUrl("")
      setText("")
      setIsOpen(false)
    }
  }

  const handleRemoveLink = () => {
    EditorCommands.execCommand("unlink")
  }

  return (
    <div className="relative flex" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Insert Link"
      >
        <Link size={16} />
      </button>

      <button
        type="button"
        onClick={handleRemoveLink}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Remove Link"
      >
        <Unlink size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[250px]">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">URL:</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text (optional):</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text"
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <button
              onClick={handleInsertLink}
              disabled={!url}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Insert Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
