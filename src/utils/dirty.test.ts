import { describe, it, expect } from "vitest"
import { hashString, isDirtyAgainst } from "./dirty"

describe("dirty hash", () => {
  it("hashes equal strings to equal values", () => {
    expect(hashString("hello")).toBe(hashString("hello"))
  })

  it("hashes different strings to different values", () => {
    expect(hashString("hello")).not.toBe(hashString("hello!"))
  })

  it("returns false for unchanged content", () => {
    const initial = hashString("<p>hi</p>")
    expect(isDirtyAgainst(initial, "<p>hi</p>")).toBe(false)
  })

  it("returns true after content change", () => {
    const initial = hashString("<p>hi</p>")
    expect(isDirtyAgainst(initial, "<p>hi there</p>")).toBe(true)
  })

  it("handles empty string", () => {
    expect(hashString("")).toBe(hashString(""))
    expect(isDirtyAgainst(hashString(""), "")).toBe(false)
  })

  it("returns non-zero 32-bit unsigned int", () => {
    const h = hashString("test")
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})
