"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp, X, Replace } from "lucide-react"

interface FindReplaceProps {
  editor: HTMLDivElement | null
  open: boolean
  onClose: () => void
  /** Notify host that content changed (so it can re-sanitize / fire onChange). */
  onChange?: () => void
}

const HIGHLIGHT_CLASS = "rte-find-hit"
const HIGHLIGHT_ACTIVE_CLASS = "rte-find-hit--active"

export function FindReplace({ editor, open, onClose, onChange }: FindReplaceProps) {
  const [query, setQuery] = useState("")
  const [replacement, setReplacement] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hitCount, setHitCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on open
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Highlight matches whenever query / case changes
  useEffect(() => {
    if (!editor || !open) {
      if (editor) clearHighlights(editor)
      setHitCount(0)
      return
    }
    if (!query) {
      clearHighlights(editor)
      setHitCount(0)
      return
    }
    const count = highlightMatches(editor, query, caseSensitive)
    setHitCount(count)
    setActiveIndex(count > 0 ? 0 : -1)
    return () => {
      if (editor) clearHighlights(editor)
    }
  }, [editor, open, query, caseSensitive])

  // Highlight the active match (visual cue + scroll into view)
  useEffect(() => {
    if (!editor) return
    const hits = editor.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    hits.forEach((el, i) => {
      if (i === activeIndex) {
        el.classList.add(HIGHLIGHT_ACTIVE_CLASS)
        el.scrollIntoView({ block: "center", behavior: "smooth" })
      } else {
        el.classList.remove(HIGHLIGHT_ACTIVE_CLASS)
      }
    })
  }, [activeIndex, editor, hitCount])

  // Clean up highlights when component closes/unmounts
  useEffect(() => {
    return () => {
      if (editor) clearHighlights(editor)
    }
  }, [editor])

  function go(delta: number) {
    if (hitCount === 0) return
    setActiveIndex((i) => (i + delta + hitCount) % hitCount)
  }

  function replaceCurrent() {
    if (!editor || hitCount === 0 || activeIndex < 0) return
    const hits = editor.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    const target = hits[activeIndex] as HTMLElement | undefined
    if (!target) return
    const textNode = document.createTextNode(replacement)
    target.replaceWith(textNode)
    onChange?.()
    // Re-highlight remaining matches
    const newCount = highlightMatches(editor, query, caseSensitive)
    setHitCount(newCount)
    setActiveIndex((i) => Math.min(i, Math.max(0, newCount - 1)))
  }

  function replaceAll() {
    if (!editor || hitCount === 0) return
    const hits = Array.from(editor.querySelectorAll(`.${HIGHLIGHT_CLASS}`))
    for (const el of hits) {
      el.replaceWith(document.createTextNode(replacement))
    }
    onChange?.()
    clearHighlights(editor)
    setHitCount(0)
    setActiveIndex(-1)
  }

  if (!open) return null

  return (
    <div className="rte-find" role="dialog" aria-label="Find and replace">
      <div className="rte-find-row">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              go(e.shiftKey ? -1 : 1)
            } else if (e.key === "Escape") {
              e.preventDefault()
              onClose()
            }
          }}
          placeholder="Find"
          className="rte-find-input"
          aria-label="Find"
        />
        <span className="rte-find-count" aria-live="polite">
          {hitCount > 0 ? `${activeIndex + 1} / ${hitCount}` : "0 / 0"}
        </span>
        <button
          type="button"
          className="rte-find-btn"
          onClick={() => go(-1)}
          disabled={hitCount === 0}
          aria-label="Previous match"
          title="Previous (Shift+Enter)"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          className="rte-find-btn"
          onClick={() => go(1)}
          disabled={hitCount === 0}
          aria-label="Next match"
          title="Next (Enter)"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          className={`rte-find-btn rte-find-toggle${caseSensitive ? " rte-find-toggle--on" : ""}`}
          onClick={() => setCaseSensitive((v) => !v)}
          aria-pressed={caseSensitive}
          title="Match case"
        >
          Aa
        </button>
        <button type="button" className="rte-find-btn" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      <div className="rte-find-row">
        <input
          type="text"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (e.shiftKey) replaceAll()
              else replaceCurrent()
            }
          }}
          placeholder="Replace with"
          className="rte-find-input"
          aria-label="Replace with"
        />
        <button
          type="button"
          className="rte-find-btn"
          onClick={replaceCurrent}
          disabled={hitCount === 0}
          title="Replace (Enter)"
        >
          <Replace size={14} /> One
        </button>
        <button
          type="button"
          className="rte-find-btn"
          onClick={replaceAll}
          disabled={hitCount === 0}
          title="Replace all (Shift+Enter)"
        >
          All
        </button>
      </div>
    </div>
  )
}

// ---------- helpers ----------

function clearHighlights(root: HTMLElement) {
  const hits = root.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
  hits.forEach((el) => {
    const text = document.createTextNode(el.textContent ?? "")
    el.replaceWith(text)
  })
  root.normalize()
}

function highlightMatches(root: HTMLElement, query: string, caseSensitive: boolean): number {
  if (!query) return 0
  clearHighlights(root)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT
      // Skip text inside script/style/code-block? Not necessary.
      const parent = node.parentElement
      if (parent && (parent.tagName === "STYLE" || parent.tagName === "SCRIPT")) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let n: Node | null = walker.nextNode()
  while (n) {
    textNodes.push(n as Text)
    n = walker.nextNode()
  }

  let count = 0
  const flags = caseSensitive ? "g" : "gi"
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(escaped, flags)

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? ""
    let m: RegExpExecArray | null
    let lastIndex = 0
    const parts: (Text | HTMLElement)[] = []
    re.lastIndex = 0
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push(document.createTextNode(text.slice(lastIndex, m.index)))
      }
      const span = document.createElement("mark")
      span.className = HIGHLIGHT_CLASS
      span.textContent = m[0]
      parts.push(span)
      lastIndex = m.index + m[0].length
      count++
      if (m[0].length === 0) re.lastIndex++ // avoid infinite loop on zero-width
    }
    if (parts.length === 0) continue
    if (lastIndex < text.length) {
      parts.push(document.createTextNode(text.slice(lastIndex)))
    }
    const parent = textNode.parentNode
    if (!parent) continue
    for (const p of parts) parent.insertBefore(p, textNode)
    parent.removeChild(textNode)
  }
  return count
}
