"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Palette, Highlighter } from "lucide-react"
import type { ColorPickerProps } from "../types"

const DEFAULT_PRESETS = [
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  "#FF0000", "#FF6600", "#FFCC00", "#FFFF00", "#CCFF00", "#66FF00",
  "#00FF00", "#00FF66", "#00FFCC", "#00FFFF", "#00CCFF", "#0066FF",
  "#0000FF", "#6600FF", "#CC00FF", "#FF00FF", "#FF00CC", "#FF0066",
]

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, type, presets }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(color)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const tiles = presets && presets.length > 0 ? presets : DEFAULT_PRESETS

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

  const Icon = type === "text" ? Palette : Highlighter

  return (
    <div className="rte-dropdown-anchor" ref={dropdownRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((v) => !v)}
        className="rte-btn"
        title={type === "text" ? "Text Color" : "Background Color"}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon size={16} />
        <span className="rte-color-swatch" style={{ background: color }} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="rte-dropdown" role="dialog" aria-label="Color picker">
          <div className="rte-color-grid">
            {tiles.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleColorSelect(presetColor)}
                className="rte-color-tile"
                style={{ background: presetColor }}
                title={presetColor}
                aria-label={`Color ${presetColor}`}
              />
            ))}
          </div>

          <div className="rte-dropdown-row">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="rte-color-input"
              aria-label="Custom color"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="rte-input"
              placeholder="#000000"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleColorSelect(customColor)}
              className="rte-btn rte-btn--primary"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
