"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Table } from "lucide-react"
import { EditorCommands } from "../utils/commands"

export const TableManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
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

  const handleInsertTable = () => {
    EditorCommands.insertTable(rows, cols)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Insert Table"
      >
        <Table size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Rows:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Number.parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Columns:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Number.parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <button
              onClick={handleInsertTable}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Insert Table
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
