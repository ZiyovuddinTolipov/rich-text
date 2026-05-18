import { describe, it, expect } from "vitest"
import { HistoryStack } from "./history"

describe("HistoryStack", () => {
  it("push/undo/redo", () => {
    const h = new HistoryStack(10)
    h.push("a")
    h.push("b")
    h.push("c")
    expect(h.canUndo()).toBe(true)
    const undone = h.undo("c")
    expect(undone).toBe("b")
    const redone = h.redo()
    expect(redone).toBe("c")
  })

  it("deduplicates consecutive identical pushes", () => {
    const h = new HistoryStack(10)
    h.push("a")
    h.push("a")
    h.push("a")
    expect(h.canUndo()).toBe(false)
  })

  it("respects capacity", () => {
    const h = new HistoryStack(2)
    h.push("a"); h.push("b"); h.push("c"); h.push("d")
    expect(h.canUndo()).toBe(true)
  })

  it("reset clears stacks", () => {
    const h = new HistoryStack(10)
    h.push("a"); h.push("b")
    h.reset("c")
    expect(h.canUndo()).toBe(false)
    expect(h.canRedo()).toBe(false)
  })
})
