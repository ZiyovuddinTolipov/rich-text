"use client"

import type React from "react"
import type { ToolbarButtonProps } from "../types"
import { EditorCommands } from "../utils/commands"

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  command,
  icon,
  title,
  isActive = false,
  onClick,
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    } else if (command) {
      EditorCommands.execCommand(command)
    }
  }

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isActive || undefined}
      aria-label={title}
      title={title}
      className={`rte-btn${isActive ? " rte-btn--active" : ""}`}
    >
      {icon}
    </button>
  )
}
