import { describe, it, expect } from "vitest"
import { HTMLSanitizer } from "./sanitizer"

describe("HTMLSanitizer", () => {
  it("keeps allowed tags", () => {
    const out = HTMLSanitizer.sanitize("<p><strong>hi</strong></p>")
    expect(out).toBe("<p><strong>hi</strong></p>")
  })

  it("strips script tags entirely", () => {
    const out = HTMLSanitizer.sanitize("<p>safe</p><script>alert(1)</script>")
    expect(out).toBe("<p>safe</p>")
  })

  it("strips iframe", () => {
    const out = HTMLSanitizer.sanitize("<iframe src='evil'></iframe>")
    expect(out).toBe("")
  })

  it("strips onclick handler", () => {
    const out = HTMLSanitizer.sanitize('<a href="https://x.com" onclick="alert(1)">x</a>')
    expect(out).toContain("href=\"https://x.com\"")
    expect(out).not.toContain("onclick")
  })

  it("blocks javascript: href", () => {
    const out = HTMLSanitizer.sanitize('<a href="javascript:alert(1)">x</a>')
    expect(out).not.toContain("javascript:")
    expect(out).toContain(">x</a>")
  })

  it("blocks data: img src except image mime", () => {
    const bad = HTMLSanitizer.sanitize('<img src="data:text/html,alert(1)" />')
    expect(bad).not.toContain("data:text")
    const good = HTMLSanitizer.sanitize('<img src="data:image/png;base64,iVBOR" />')
    expect(good).toContain("data:image/png")
  })

  it("keeps safe style declarations by default", () => {
    const out = HTMLSanitizer.sanitize('<p style="color:red">x</p>')
    expect(out).toMatch(/color\s*:\s*red/)
  })

  it("strips dangerous style declarations", () => {
    const out = HTMLSanitizer.sanitize(
      '<p style="color:red;mso-fareast-language:EN;position:fixed;top:0">x</p>',
    )
    expect(out).toMatch(/color\s*:\s*red/)
    expect(out).not.toMatch(/mso-/)
    expect(out).not.toMatch(/position\s*:\s*fixed/)
  })

  it("drops style attribute entirely when no safe declarations remain", () => {
    const out = HTMLSanitizer.sanitize('<p style="expression(alert(1))">x</p>')
    expect(out).not.toContain("style")
  })

  it("adds rel=noopener to target=_blank links", () => {
    const out = HTMLSanitizer.sanitize('<a href="https://x.com" target="_blank">x</a>')
    expect(out).toContain('rel="noopener noreferrer"')
  })

  it("preserves task list attributes", () => {
    const html = '<ul data-type="task"><li data-checked="true">x</li></ul>'
    const out = HTMLSanitizer.sanitize(html)
    expect(out).toContain('data-type="task"')
    expect(out).toContain('data-checked="true"')
  })

  it("extractText returns plain text", () => {
    expect(HTMLSanitizer.extractText("<p>hello <strong>world</strong></p>")).toBe("hello world")
  })
})
