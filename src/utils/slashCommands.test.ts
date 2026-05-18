import { describe, it, expect } from "vitest"
import { DEFAULT_SLASH_COMMANDS, filterSlashCommands } from "./slashCommands"

describe("filterSlashCommands", () => {
  it("returns all when query is empty", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "")
    expect(out).toBe(DEFAULT_SLASH_COMMANDS)
  })

  it("matches by label", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "head")
    expect(out.some((c) => c.id === "h1")).toBe(true)
    expect(out.some((c) => c.id === "h2")).toBe(true)
    expect(out.some((c) => c.id === "table")).toBe(false)
  })

  it("matches by id", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "h1")
    expect(out[0].id).toBe("h1")
  })

  it("matches by keyword", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "todo")
    expect(out.some((c) => c.id === "task")).toBe(true)
  })

  it("is case-insensitive", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "TABLE")
    expect(out.some((c) => c.id === "table")).toBe(true)
  })

  it("returns empty for no matches", () => {
    const out = filterSlashCommands(DEFAULT_SLASH_COMMANDS, "xyzzy123")
    expect(out).toEqual([])
  })
})
