/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest"
import {
  cleanPastedHtml,
  isExternalPaste,
  looksLikeGoogleDocsPaste,
  looksLikeWordPaste,
} from "./pasteCleanup"

const WORD_SAMPLE = `<html xmlns:o="urn:schemas-microsoft-com/office/office"
xmlns:w="urn:schemas-microsoft-com/office/word">
<!--[if gte mso 9]><xml><o:OfficeDocumentSettings /></xml><![endif]-->
<style>.MsoNormal { margin:0; }</style>
<p class="MsoNormal" style="mso-line-height:single">Hello <o:p></o:p></p>
<p class="MsoNormal"><span style="mso-fareast-language:EN-US">World</span></p>`

const GDOCS_SAMPLE = `<meta charset="utf-8"><b id="docs-internal-guid-abc-123"
style="font-weight:normal;"><p dir="ltr" style="line-height:1.38;text-align:left;">
<span style="font-size:11pt;font-family:Arial;color:#000000;">Hello</span>
<span style="font-weight:bold;">bold here</span></p></b>`

describe("paste cleanup detection", () => {
  it("detects Word", () => {
    expect(looksLikeWordPaste(WORD_SAMPLE)).toBe(true)
  })

  it("detects Google Docs", () => {
    expect(looksLikeGoogleDocsPaste(GDOCS_SAMPLE)).toBe(true)
  })

  it("isExternalPaste true for both", () => {
    expect(isExternalPaste(WORD_SAMPLE)).toBe(true)
    expect(isExternalPaste(GDOCS_SAMPLE)).toBe(true)
  })

  it("isExternalPaste false for clean HTML", () => {
    expect(isExternalPaste("<p>plain html</p>")).toBe(false)
  })
})

describe("cleanPastedHtml", () => {
  it("removes Word mso conditional comments and namespaces", () => {
    const out = cleanPastedHtml(WORD_SAMPLE)
    expect(out).not.toMatch(/mso-/i)
    expect(out).not.toMatch(/<o:p>/)
    expect(out).not.toMatch(/MsoNormal/)
    expect(out).not.toMatch(/<!--\[if/)
    expect(out).toContain("Hello")
    expect(out).toContain("World")
  })

  it("removes Google Docs guid wrapper but keeps bold styling", () => {
    const out = cleanPastedHtml(GDOCS_SAMPLE)
    expect(out).not.toMatch(/docs-internal-guid/)
    expect(out).toContain("Hello")
    // span with font-weight:bold preserved (semantic style)
    expect(out).toContain("bold here")
  })

  it("strips class, id, lang, style attributes from plain elements", () => {
    const out = cleanPastedHtml(
      '<p class="x" id="y" lang="en" style="color:red" dir="ltr">Hi</p>',
    )
    expect(out).toBe("<p>Hi</p>")
  })

  it("unwraps empty span elements", () => {
    const out = cleanPastedHtml('<p><span><span>nested</span></span></p>')
    expect(out).toBe("<p>nested</p>")
  })

  it("removes meta, link, style, script tags entirely", () => {
    const out = cleanPastedHtml(
      '<meta charset="utf-8"><style>x{}</style><script>alert(1)</script><p>OK</p>',
    )
    expect(out).toBe("<p>OK</p>")
  })

  it("converts nbsp to regular space", () => {
    const out = cleanPastedHtml("<p>a\u00A0b</p>")
    expect(out).toBe("<p>a b</p>")
  })
})
