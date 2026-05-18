"use client"

import type React from "react"
import { useState, useEffect, useMemo, Fragment } from "react"
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Quote, Code, Code2, Minus, Undo, Redo, Eraser,
  Indent, Outdent,
} from "lucide-react"
import { ToolbarButton } from "./ToolbarButton"
import { ColorPicker } from "./ColorPicker"
import { ImageHandler } from "./ImageHandler"
import { TableManager } from "./TableManager"
import { LinkManager } from "./LinkManager"
import { EditorCommands } from "../utils/commands"
import type { BuiltInToolbarItem, ToolbarItem, ToolbarPreset, ToolbarButtonConfig } from "../types"

interface ToolbarProps {
  items?: ToolbarPreset | ToolbarItem[]
  customButtons?: ToolbarButtonConfig[]
  textColorPresets?: string[]
  backgroundColorPresets?: string[]
  onSelectionChange?: () => void
  onUndo?: () => void
  onRedo?: () => void
}

const PRESETS: Record<ToolbarPreset, BuiltInToolbarItem[]> = {
  all: [
    "undo", "redo", "|",
    "heading", "|",
    "bold", "italic", "underline", "strike", "sub", "sup", "|",
    "colorText", "colorBg", "|",
    "alignLeft", "alignCenter", "alignRight", "alignJustify", "|",
    "ul", "ol", "checklist", "indent", "outdent", "|",
    "quote", "codeblock", "hr", "|",
    "link", "image", "table", "|",
    "clear",
  ],
  basic: [
    "bold", "italic", "underline", "|",
    "heading", "|",
    "ul", "ol", "|",
    "link", "image", "|",
    "undo", "redo", "clear",
  ],
  minimal: ["bold", "italic", "underline", "|", "link", "|", "undo", "redo"],
}

export const Toolbar: React.FC<ToolbarProps> = ({
  items = "all",
  customButtons,
  textColorPresets,
  backgroundColorPresets,
  onSelectionChange,
  onUndo,
  onRedo,
}) => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({})
  const [textColor, setTextColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffff00")

  useEffect(() => {
    const update = () => {
      setActiveStates({
        bold: EditorCommands.queryCommandState("bold"),
        italic: EditorCommands.queryCommandState("italic"),
        underline: EditorCommands.queryCommandState("underline"),
        strikeThrough: EditorCommands.queryCommandState("strikeThrough"),
        subscript: EditorCommands.queryCommandState("subscript"),
        superscript: EditorCommands.queryCommandState("superscript"),
        justifyLeft: EditorCommands.queryCommandState("justifyLeft"),
        justifyCenter: EditorCommands.queryCommandState("justifyCenter"),
        justifyRight: EditorCommands.queryCommandState("justifyRight"),
        justifyFull: EditorCommands.queryCommandState("justifyFull"),
        insertUnorderedList: EditorCommands.queryCommandState("insertUnorderedList"),
        insertOrderedList: EditorCommands.queryCommandState("insertOrderedList"),
      })
      onSelectionChange?.()
    }
    document.addEventListener("selectionchange", update)
    return () => document.removeEventListener("selectionchange", update)
  }, [onSelectionChange])

  const handleHeading = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value) EditorCommands.execCommand("formatBlock", value)
    event.target.value = ""
  }

  const resolvedItems: ToolbarItem[] = useMemo(() => {
    if (Array.isArray(items)) return items
    return PRESETS[items] ?? PRESETS.all
  }, [items])

  const renderBuiltIn = (id: BuiltInToolbarItem, key: number): React.ReactNode => {
    switch (id) {
      case "|":
        return <span key={key} className="rte-toolbar-separator" aria-hidden="true" />
      case "undo":
        return <ToolbarButton key={key} command="undo" icon={<Undo size={16} />} title="Undo" onClick={onUndo} />
      case "redo":
        return <ToolbarButton key={key} command="redo" icon={<Redo size={16} />} title="Redo" onClick={onRedo} />
      case "heading":
        return (
          <select
            key={key}
            onChange={handleHeading}
            defaultValue=""
            className="rte-select"
            aria-label="Heading style"
          >
            <option value="">Format</option>
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        )
      case "bold":
        return <ToolbarButton key={key} command="bold" icon={<Bold size={16} />} title="Bold" isActive={activeStates.bold} />
      case "italic":
        return <ToolbarButton key={key} command="italic" icon={<Italic size={16} />} title="Italic" isActive={activeStates.italic} />
      case "underline":
        return <ToolbarButton key={key} command="underline" icon={<Underline size={16} />} title="Underline" isActive={activeStates.underline} />
      case "strike":
        return <ToolbarButton key={key} command="strikeThrough" icon={<Strikethrough size={16} />} title="Strikethrough" isActive={activeStates.strikeThrough} />
      case "sub":
        return <ToolbarButton key={key} command="subscript" icon={<Subscript size={16} />} title="Subscript" isActive={activeStates.subscript} />
      case "sup":
        return <ToolbarButton key={key} command="superscript" icon={<Superscript size={16} />} title="Superscript" isActive={activeStates.superscript} />
      case "colorText":
        return (
          <ColorPicker
            key={key}
            color={textColor}
            type="text"
            presets={textColorPresets}
            onChange={(c) => { setTextColor(c); EditorCommands.setForeColor(c) }}
          />
        )
      case "colorBg":
        return (
          <ColorPicker
            key={key}
            color={backgroundColor}
            type="background"
            presets={backgroundColorPresets}
            onChange={(c) => { setBackgroundColor(c); EditorCommands.setBackColor(c) }}
          />
        )
      case "alignLeft":
        return <ToolbarButton key={key} command="justifyLeft" icon={<AlignLeft size={16} />} title="Align Left" isActive={activeStates.justifyLeft} />
      case "alignCenter":
        return <ToolbarButton key={key} command="justifyCenter" icon={<AlignCenter size={16} />} title="Align Center" isActive={activeStates.justifyCenter} />
      case "alignRight":
        return <ToolbarButton key={key} command="justifyRight" icon={<AlignRight size={16} />} title="Align Right" isActive={activeStates.justifyRight} />
      case "alignJustify":
        return <ToolbarButton key={key} command="justifyFull" icon={<AlignJustify size={16} />} title="Justify" isActive={activeStates.justifyFull} />
      case "ul":
        return <ToolbarButton key={key} command="insertUnorderedList" icon={<List size={16} />} title="Bullet List" isActive={activeStates.insertUnorderedList} />
      case "ol":
        return <ToolbarButton key={key} command="insertOrderedList" icon={<ListOrdered size={16} />} title="Numbered List" isActive={activeStates.insertOrderedList} />
      case "checklist":
        return <ToolbarButton key={key} icon={<CheckSquare size={16} />} title="Checklist" onClick={() => EditorCommands.insertChecklist()} />
      case "indent":
        return <ToolbarButton key={key} icon={<Indent size={16} />} title="Indent" onClick={() => EditorCommands.indent()} />
      case "outdent":
        return <ToolbarButton key={key} icon={<Outdent size={16} />} title="Outdent" onClick={() => EditorCommands.outdent()} />
      case "quote":
        return <ToolbarButton key={key} icon={<Quote size={16} />} title="Blockquote" onClick={() => EditorCommands.execCommand("formatBlock", "blockquote")} />
      case "code":
        return <ToolbarButton key={key} icon={<Code size={16} />} title="Inline Code" onClick={() => EditorCommands.insertHTML(`<code>${getSelectionHtml() || "code"}</code>`)} />
      case "codeblock":
        return <ToolbarButton key={key} icon={<Code2 size={16} />} title="Code Block" onClick={() => EditorCommands.execCommand("formatBlock", "pre")} />
      case "hr":
        return <ToolbarButton key={key} icon={<Minus size={16} />} title="Horizontal Line" onClick={() => EditorCommands.insertHorizontalRule()} />
      case "link":
        return <LinkManager key={key} />
      case "image":
        return <ImageHandler key={key} />
      case "table":
        return <TableManager key={key} />
      case "clear":
        return <ToolbarButton key={key} command="removeFormat" icon={<Eraser size={16} />} title="Clear Formatting" />
      default:
        return null
    }
  }

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Editor toolbar">
      {resolvedItems.map((item, i) => {
        if (typeof item === "string") return renderBuiltIn(item, i)
        return (
          <ToolbarButton
            key={`custom-${item.id}-${i}`}
            icon={item.icon}
            title={item.title}
            onClick={item.onClick}
            isActive={item.isActive}
          />
        )
      })}
      {customButtons?.map((btn, i) => (
        <Fragment key={`extra-${btn.id}-${i}`}>
          <ToolbarButton icon={btn.icon} title={btn.title} onClick={btn.onClick} isActive={btn.isActive} />
        </Fragment>
      ))}
    </div>
  )
}

function getSelectionHtml(): string {
  if (typeof window === "undefined") return ""
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return ""
  const range = sel.getRangeAt(0)
  const div = document.createElement("div")
  div.appendChild(range.cloneContents())
  return div.innerHTML
}
