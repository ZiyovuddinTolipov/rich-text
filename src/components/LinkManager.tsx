"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link as LinkIcon, Unlink } from "lucide-react"
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
    if (!url) return
    EditorCommands.createLink(url, text || undefined)
    setUrl("")
    setText("")
    setIsOpen(false)
  }

  const handleRemoveLink = () => EditorCommands.execCommand("unlink")

  return (
    <div className="rte-dropdown-anchor" ref={dropdownRef} style={{ display: "flex" }}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((v) => !v)}
        className="rte-btn"
        title="Insert Link"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleRemoveLink}
        className="rte-btn"
        title="Remove Link"
        aria-label="Remove link"
      >
        <Unlink size={16} />
      </button>

      {isOpen && (
        <div className="rte-dropdown" role="dialog" aria-label="Insert link" style={{ minWidth: 260 }}>
          <div className="rte-dropdown-field">
            <label className="rte-dropdown-label" htmlFor="rte-link-url">URL</label>
            <input
              id="rte-link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="rte-input"
              style={{ width: "100%" }}
            />
          </div>
          <div className="rte-dropdown-field">
            <label className="rte-dropdown-label" htmlFor="rte-link-text">Text (optional)</label>
            <input
              id="rte-link-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
              className="rte-input"
              style={{ width: "100%" }}
            />
          </div>
          <button
            type="button"
            onClick={handleInsertLink}
            disabled={!url}
            className="rte-btn rte-btn--primary"
            style={{ width: "100%" }}
          >
            Insert Link
          </button>
        </div>
      )}
    </div>
  )
}
