"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Table as TableIcon } from "lucide-react"
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
    <div className="rte-dropdown-anchor" ref={dropdownRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((v) => !v)}
        className="rte-btn"
        title="Insert Table"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <TableIcon size={16} />
      </button>

      {isOpen && (
        <div className="rte-dropdown" role="dialog" aria-label="Insert table">
          <div className="rte-dropdown-field">
            <label className="rte-dropdown-label" htmlFor="rte-table-rows">Rows</label>
            <input
              id="rte-table-rows"
              type="number"
              min={1}
              max={50}
              value={rows}
              onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
              className="rte-input"
              style={{ width: "100%" }}
            />
          </div>
          <div className="rte-dropdown-field">
            <label className="rte-dropdown-label" htmlFor="rte-table-cols">Columns</label>
            <input
              id="rte-table-cols"
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
              className="rte-input"
              style={{ width: "100%" }}
            />
          </div>
          <button
            type="button"
            onClick={handleInsertTable}
            className="rte-btn rte-btn--primary"
            style={{ width: "100%" }}
          >
            Insert Table
          </button>
        </div>
      )}
    </div>
  )
}
