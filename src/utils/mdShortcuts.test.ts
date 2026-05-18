import { describe, it, expect, beforeEach } from "vitest"
import { applyMarkdownShortcut, __test } from "./mdShortcuts"

describe("matchInline", () => {
  it("matches **bold**", () => {
    const m = __test.matchInline("hello **world**")
    expect(m).toMatchObject({ inner: "world", tag: "strong" })
  })

  it("matches *italic*", () => {
    const m = __test.matchInline("a *italic*")
    expect(m).toMatchObject({ inner: "italic", tag: "em" })
  })

  it("matches ~~strike~~", () => {
    const m = __test.matchInline("foo ~~bar~~")
    expect(m).toMatchObject({ inner: "bar", tag: "del" })
  })

  it("matches `code`", () => {
    const m = __test.matchInline("`x()`")
    expect(m).toMatchObject({ inner: "x()", tag: "code" })
  })

  it("does not match incomplete bold", () => {
    expect(__test.matchInline("**bold")).toBeNull()
  })

  it("does not match across newlines", () => {
    expect(__test.matchInline("**bo\nld**")).toBeNull()
  })
})

describe("matchBlock", () => {
  it("matches # heading", () => {
    expect(__test.matchBlock("#")?.spec).toMatchObject({ kind: "heading", level: 1 })
    expect(__test.matchBlock("###")?.spec).toMatchObject({ kind: "heading", level: 3 })
    expect(__test.matchBlock("######")?.spec).toMatchObject({ kind: "heading", level: 6 })
  })

  it("rejects 7+ hashes", () => {
    expect(__test.matchBlock("#######")).toBeNull()
  })

  it("matches > as blockquote", () => {
    expect(__test.matchBlock(">")?.spec.kind).toBe("blockquote")
  })

  it("matches list triggers", () => {
    expect(__test.matchBlock("-")?.spec.kind).toBe("ul")
    expect(__test.matchBlock("*")?.spec.kind).toBe("ul")
    expect(__test.matchBlock("1.")?.spec.kind).toBe("ol")
  })

  it("matches task list", () => {
    expect(__test.matchBlock("[]")?.spec.kind).toBe("task")
    expect(__test.matchBlock("[ ]")?.spec.kind).toBe("task")
  })

  it("matches --- as hr and ``` as codeblock", () => {
    expect(__test.matchBlock("---")?.spec.kind).toBe("hr")
    expect(__test.matchBlock("```")?.spec.kind).toBe("codeblock")
  })

  it("rejects random text", () => {
    expect(__test.matchBlock("foo")).toBeNull()
    expect(__test.matchBlock("##bar")).toBeNull()
  })
})

describe("applyMarkdownShortcut — inline transform", () => {
  let root: HTMLDivElement

  beforeEach(() => {
    document.body.innerHTML = ""
    root = document.createElement("div")
    root.contentEditable = "true"
    document.body.appendChild(root)
  })

  it("converts **bold** when space typed", () => {
    const p = document.createElement("p")
    const text = document.createTextNode("**hi**")
    p.appendChild(text)
    root.appendChild(p)

    const sel = window.getSelection()!
    const range = document.createRange()
    range.setStart(text, 6)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    const evt = new KeyboardEvent("keydown", { key: " ", cancelable: true })
    const handled = applyMarkdownShortcut(evt, root)
    expect(handled).toBe(true)
    expect(p.querySelector("strong")?.textContent).toBe("hi")
  })

  it("converts # to h1 at start of block", () => {
    const p = document.createElement("p")
    const text = document.createTextNode("#")
    p.appendChild(text)
    root.appendChild(p)

    const sel = window.getSelection()!
    const range = document.createRange()
    range.setStart(text, 1)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    const evt = new KeyboardEvent("keydown", { key: " ", cancelable: true })
    const handled = applyMarkdownShortcut(evt, root)
    expect(handled).toBe(true)
    expect(root.querySelector("h1")).not.toBeNull()
  })

  it("converts > to blockquote", () => {
    const p = document.createElement("p")
    const text = document.createTextNode(">")
    p.appendChild(text)
    root.appendChild(p)

    const sel = window.getSelection()!
    const range = document.createRange()
    range.setStart(text, 1)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    const evt = new KeyboardEvent("keydown", { key: " ", cancelable: true })
    const handled = applyMarkdownShortcut(evt, root)
    expect(handled).toBe(true)
    expect(root.querySelector("blockquote")).not.toBeNull()
  })

  it("ignores non-space keys", () => {
    const evt = new KeyboardEvent("keydown", { key: "a", cancelable: true })
    expect(applyMarkdownShortcut(evt, root)).toBe(false)
  })
})
