"use client"

import type React from "react"
import type { ToolbarButtonProps } from "../types"

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  command,
  icon,
  title,
  isActive = false,
  onClick,
  disabled = false,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      document.execCommand(command, false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-8 h-8 rounded transition-colors
        ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      title={title}
    >
      {icon}
    </button>
  )
}
