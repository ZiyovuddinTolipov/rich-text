"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Eraser,
} from "lucide-react"
import { ToolbarButton } from "./ToolbarButton"
import { ColorPicker } from "./ColorPicker"
import { ImageHandler } from "./ImageHandler"
import { TableManager } from "./TableManager"
import { LinkManager } from "./LinkManager"
import { EditorCommands } from "../utils/commands"

interface ToolbarProps {
  onSelectionChange?: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onSelectionChange }) => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({})
  const [textColor, setTextColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")

  useEffect(() => {
    const updateActiveStates = () => {
      const states = {
        bold: EditorCommands.queryCommandState("bold"),
        italic: EditorCommands.queryCommandState("italic"),
        underline: EditorCommands.queryCommandState("underline"),
        strikeThrough: EditorCommands.queryCommandState("strikeThrough"),
        justifyLeft: EditorCommands.queryCommandState("justifyLeft"),
        justifyCenter: EditorCommands.queryCommandState("justifyCenter"),
        justifyRight: EditorCommands.queryCommandState("justifyRight"),
        justifyFull: EditorCommands.queryCommandState("justifyFull"),
        insertUnorderedList: EditorCommands.queryCommandState("insertUnorderedList"),
        insertOrderedList: EditorCommands.queryCommandState("insertOrderedList"),
      }

      setActiveStates(states)
      onSelectionChange?.()
    }

    document.addEventListener("selectionchange", updateActiveStates)
    return () => document.removeEventListener("selectionchange", updateActiveStates)
  }, [onSelectionChange])

  const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value) {
      EditorCommands.execCommand("formatBlock", value)
    }
  }

  const handleTextColorChange = (color: string) => {
    setTextColor(color)
    EditorCommands.setForeColor(color)
  }

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color)
    EditorCommands.setBackColor(color)
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton command="undo" icon={<Undo size={16} />} title="Undo" />
        <ToolbarButton command="redo" icon={<Redo size={16} />} title="Redo" />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <select
        onChange={handleHeadingChange}
        className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 mr-2"
        defaultValue=""
      >
        <option value="">Format</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="p">Paragraph</option>
      </select>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton command="bold" icon={<Bold size={16} />} title="Bold" isActive={activeStates.bold} />
        <ToolbarButton command="italic" icon={<Italic size={16} />} title="Italic" isActive={activeStates.italic} />
        <ToolbarButton
          command="underline"
          icon={<Underline size={16} />}
          title="Underline"
          isActive={activeStates.underline}
        />
        <ToolbarButton
          command="strikeThrough"
          icon={<Strikethrough size={16} />}
          title="Strikethrough"
          isActive={activeStates.strikeThrough}
        />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Colors */}
      <div className="flex items-center gap-1 mr-2">
        <ColorPicker color={textColor} onChange={handleTextColorChange} type="text" />
        <ColorPicker color={backgroundColor} onChange={handleBackgroundColorChange} type="background" />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Alignment */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          command="justifyLeft"
          icon={<AlignLeft size={16} />}
          title="Align Left"
          isActive={activeStates.justifyLeft}
        />
        <ToolbarButton
          command="justifyCenter"
          icon={<AlignCenter size={16} />}
          title="Align Center"
          isActive={activeStates.justifyCenter}
        />
        <ToolbarButton
          command="justifyRight"
          icon={<AlignRight size={16} />}
          title="Align Right"
          isActive={activeStates.justifyRight}
        />
        <ToolbarButton
          command="justifyFull"
          icon={<AlignJustify size={16} />}
          title="Justify"
          isActive={activeStates.justifyFull}
        />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          command="insertUnorderedList"
          icon={<List size={16} />}
          title="Bullet List"
          isActive={activeStates.insertUnorderedList}
        />
        <ToolbarButton
          command="insertOrderedList"
          icon={<ListOrdered size={16} />}
          title="Numbered List"
          isActive={activeStates.insertOrderedList}
        />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Block Elements */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          command="formatBlock"
          icon={<Quote size={16} />}
          title="Blockquote"
          onClick={() => EditorCommands.execCommand("formatBlock", "blockquote")}
        />
        <ToolbarButton
          command="formatBlock"
          icon={<Code size={16} />}
          title="Code Block"
          onClick={() => EditorCommands.execCommand("formatBlock", "pre")}
        />
        <ToolbarButton command="insertHorizontalRule" icon={<Minus size={16} />} title="Horizontal Line" />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Media & Links */}
      <div className="flex items-center gap-1 mr-2">
        <LinkManager />
        <ImageHandler />
        <TableManager />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Clear Formatting */}
      <ToolbarButton command="removeFormat" icon={<Eraser size={16} />} title="Clear Formatting" />
    </div>
  )
}
