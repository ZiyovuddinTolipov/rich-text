"use client"

import type { ReactElement } from "react"
import { useEffect, useRef, useState } from "react"
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  Link2, Link2Off, Quote,
} from "lucide-react"
import type { BubbleItem } from "../types"
import { EditorCommands } from "../utils/commands"

const DEFAULTS: BubbleItem[] = ["bold", "italic", "underline", "|", "link", "quote"]

interface BubbleState {
  open: boolean
  top: number
  left: number
}

export interface BubbleToolbarProps {
  editor: HTMLElement | null
  items?: true | BubbleItem[]
  onAction?: () => void
}

export function BubbleToolbar({ editor, items = true, onAction }: BubbleToolbarProps) {
  const [state, setState] = useState<BubbleState>({ open: false, top: 0, left: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)
  const list = items === true ? DEFAULTS : items

  useEffect(() => {
    if (!editor) return

    const update = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setState((s) => (s.open ? { ...s, open: false } : s))
        return
      }
      const range = sel.getRangeAt(0)
      const target = range.commonAncestorContainer
      const inEditor = target === editor || editor.contains(target)
      if (!inEditor) {
        setState((s) => (s.open ? { ...s, open: false } : s))
        return
      }
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setState((s) => (s.open ? { ...s, open: false } : s))
        return
      }
      const tbRect = toolbarRef.current?.getBoundingClientRect()
      const tbWidth = tbRect?.width ?? 240
      const tbHeight = tbRect?.height ?? 36
      const top = Math.max(8, rect.top + window.scrollY - tbHeight - 8)
      const left = Math.max(
        8,
        Math.min(
          window.innerWidth - tbWidth - 8,
          rect.left + window.scrollX + rect.width / 2 - tbWidth / 2,
        ),
      )
      setState({ open: true, top, left })
    }

    document.addEventListener("selectionchange", update)
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      document.removeEventListener("selectionchange", update)
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [editor])

  if (!state.open) return null

  return (
    <div
      ref={toolbarRef}
      className="rte-bubble"
      style={{ top: state.top, left: state.left }}
      role="toolbar"
      aria-label="Selection toolbar"
      onMouseDown={(e) => e.preventDefault()}
    >
      {list.map((item, i) =>
        item === "|" ? (
          <span key={`sep-${i}`} className="rte-bubble-sep" aria-hidden="true" />
        ) : (
          <BubbleBtn key={`${item}-${i}`} item={item} onAction={onAction} />
        ),
      )}
    </div>
  )
}

interface BtnProps {
  item: Exclude<BubbleItem, "|">
  onAction?: () => void
}

function BubbleBtn({ item, onAction }: BtnProps) {
  const { title, icon, run } = BUTTONS[item]
  return (
    <button
      type="button"
      className="rte-bubble-btn"
      title={title}
      aria-label={title}
      onMouseDown={(e) => {
        e.preventDefault()
        run()
        onAction?.()
      }}
    >
      {icon}
    </button>
  )
}

const ICON_SIZE = 14

const BUTTONS: Record<Exclude<BubbleItem, "|">, { title: string; icon: ReactElement; run: () => void }> = {
  bold: { title: "Bold", icon: <Bold size={ICON_SIZE} />, run: () => EditorCommands.execCommand("bold") },
  italic: { title: "Italic", icon: <Italic size={ICON_SIZE} />, run: () => EditorCommands.execCommand("italic") },
  underline: { title: "Underline", icon: <Underline size={ICON_SIZE} />, run: () => EditorCommands.execCommand("underline") },
  strike: { title: "Strikethrough", icon: <Strikethrough size={ICON_SIZE} />, run: () => EditorCommands.execCommand("strikeThrough") },
  code: { title: "Inline code", icon: <Code size={ICON_SIZE} />, run: () => EditorCommands.insertHTML(`<code>${getSelectedText()}</code>`) },
  h1: { title: "Heading 1", icon: <Heading1 size={ICON_SIZE} />, run: () => EditorCommands.execCommand("formatBlock", "<h1>") },
  h2: { title: "Heading 2", icon: <Heading2 size={ICON_SIZE} />, run: () => EditorCommands.execCommand("formatBlock", "<h2>") },
  h3: { title: "Heading 3", icon: <Heading3 size={ICON_SIZE} />, run: () => EditorCommands.execCommand("formatBlock", "<h3>") },
  link: {
    title: "Link",
    icon: <Link2 size={ICON_SIZE} />,
    run: () => {
      const url = window.prompt("URL")
      if (url) EditorCommands.createLink(url)
    },
  },
  unlink: { title: "Remove link", icon: <Link2Off size={ICON_SIZE} />, run: () => EditorCommands.execCommand("unlink") },
  quote: { title: "Quote", icon: <Quote size={ICON_SIZE} />, run: () => EditorCommands.execCommand("formatBlock", "<blockquote>") },
}

function getSelectedText(): string {
  const sel = typeof window !== "undefined" ? window.getSelection() : null
  return sel?.toString() ?? ""
}
