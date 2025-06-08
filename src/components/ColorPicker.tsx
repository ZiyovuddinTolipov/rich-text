"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Palette } from "lucide-react"
import type { ColorPickerProps } from "../types"

const PRESET_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#CCCCCC",
  "#FFFFFF",
  "#FF0000",
  "#FF6600",
  "#FFCC00",
  "#FFFF00",
  "#CCFF00",
  "#66FF00",
  "#00FF00",
  "#00FF66",
  "#00FFCC",
  "#00FFFF",
  "#00CCFF",
  "#0066FF",
  "#0000FF",
  "#6600FF",
  "#CC00FF",
  "#FF00FF",
  "#FF00CC",
  "#FF0066",
]

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, type }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(color)
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

  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor)
    setCustomColor(selectedColor)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title={`${type === "text" ? "Text" : "Background"} Color`}
      >
        <Palette size={16} />
        <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: color }} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="grid grid-cols-6 gap-1 mb-3">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => handleColorSelect(presetColor)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="#000000"
            />
            <button
              type="button"
              onClick={() => handleColorSelect(customColor)}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
