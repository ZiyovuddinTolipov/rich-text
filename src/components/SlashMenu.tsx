"use client"

import { useEffect, useMemo, useState } from "react"
import type { SlashCommand } from "../types"
import { filterSlashCommands } from "../utils/slashCommands"

export interface SlashMenuProps {
  open: boolean
  query: string
  position: { top: number; left: number }
  commands: SlashCommand[]
  onSelect: (cmd: SlashCommand) => void
  onClose: () => void
}

export function SlashMenu({ open, query, position, commands, onSelect, onClose }: SlashMenuProps) {
  const [active, setActive] = useState(0)
  const filtered = useMemo(() => filterSlashCommands(commands, query), [commands, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (filtered.length === 0) return
    if (active >= filtered.length) setActive(filtered.length - 1)
  }, [filtered, active])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (filtered.length > 0) setActive((a) => (a + 1) % filtered.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (filtered.length > 0) setActive((a) => (a - 1 + filtered.length) % filtered.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        if (filtered[active]) {
          e.preventDefault()
          onSelect(filtered[active])
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [open, filtered, active, onSelect, onClose])

  if (!open) return null

  return (
    <div
      className="rte-slash-menu"
      style={{ top: position.top, left: position.left }}
      role="listbox"
      aria-label="Slash commands"
    >
      {filtered.length === 0 ? (
        <div className="rte-slash-empty">No matches</div>
      ) : (
        filtered.map((cmd, i) => (
          <button
            type="button"
            key={cmd.id}
            className={`rte-slash-item${i === active ? " rte-slash-item--active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(cmd)
            }}
            role="option"
            aria-selected={i === active}
          >
            {cmd.icon && <span className="rte-slash-icon">{cmd.icon}</span>}
            <span className="rte-slash-body">
              <span className="rte-slash-label">{cmd.label}</span>
              {cmd.description && <span className="rte-slash-desc">{cmd.description}</span>}
            </span>
          </button>
        ))
      )}
    </div>
  )
}
