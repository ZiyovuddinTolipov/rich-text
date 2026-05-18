import { describe, it, expect } from "vitest"
import { EditorCommands } from "./commands"

describe("EditorCommands.stats", () => {
  it("counts words and characters", () => {
    const s = EditorCommands.stats("<p>hello world</p>")
    expect(s.words).toBe(2)
    expect(s.characters).toBe(11)
    expect(s.charactersNoSpaces).toBe(10)
  })

  it("returns zeros for empty html", () => {
    expect(EditorCommands.stats("")).toEqual({ characters: 0, charactersNoSpaces: 0, words: 0 })
    expect(EditorCommands.stats("<p></p>")).toEqual({ characters: 0, charactersNoSpaces: 0, words: 0 })
  })

  it("extractText returns text from html", () => {
    expect(EditorCommands.extractText("<p>hi <strong>there</strong></p>")).toBe("hi there")
  })
})
