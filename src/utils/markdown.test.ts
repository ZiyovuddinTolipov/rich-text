import { describe, it, expect } from "vitest"
import { htmlToMarkdown } from "./markdown"

describe("htmlToMarkdown", () => {
  it("converts headings", () => {
    expect(htmlToMarkdown("<h1>Title</h1>")).toBe("# Title")
    expect(htmlToMarkdown("<h3>Sub</h3>")).toBe("### Sub")
  })

  it("converts bold + italic", () => {
    expect(htmlToMarkdown("<p><strong>hi</strong> <em>there</em></p>")).toBe("**hi** *there*")
  })

  it("converts links", () => {
    expect(htmlToMarkdown('<a href="https://x.com">x</a>')).toBe("[x](https://x.com)")
  })

  it("converts images", () => {
    expect(htmlToMarkdown('<img src="a.png" alt="alt" />')).toBe("![alt](a.png)")
  })

  it("converts unordered lists", () => {
    const out = htmlToMarkdown("<ul><li>a</li><li>b</li></ul>")
    expect(out).toContain("- a")
    expect(out).toContain("- b")
  })

  it("converts ordered lists", () => {
    const out = htmlToMarkdown("<ol><li>a</li><li>b</li></ol>")
    expect(out).toContain("1. a")
    expect(out).toContain("2. b")
  })

  it("converts task lists with checked state", () => {
    const out = htmlToMarkdown(
      '<ul data-type="task"><li data-checked="true">done</li><li data-checked="false">todo</li></ul>',
    )
    expect(out).toContain("- [x] done")
    expect(out).toContain("- [ ] todo")
  })

  it("converts code blocks", () => {
    const out = htmlToMarkdown("<pre><code>const x = 1</code></pre>")
    expect(out).toContain("```")
    expect(out).toContain("const x = 1")
  })

  it("converts blockquote", () => {
    const out = htmlToMarkdown("<blockquote>quoted</blockquote>")
    expect(out).toContain("> quoted")
  })

  it("converts hr", () => {
    expect(htmlToMarkdown("<hr>")).toContain("---")
  })
})
