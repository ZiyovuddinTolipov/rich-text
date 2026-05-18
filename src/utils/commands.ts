import type { EditorStats } from "../types"

const isClient = () => typeof document !== "undefined"

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export class EditorCommands {
  static execCommand(command: string, value?: string): boolean {
    if (!isClient()) return false
    try {
      return document.execCommand(command, false, value)
    } catch (error) {
      console.warn("Command execution failed:", command, error)
      return false
    }
  }

  static queryCommandState(command: string): boolean {
    if (!isClient()) return false
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  static queryCommandValue(command: string): string {
    if (!isClient()) return ""
    try {
      return document.queryCommandValue(command)
    } catch {
      return ""
    }
  }

  static insertHTML(html: string): void {
    if (!isClient()) return
    const selection = window.getSelection()
    if (!selection?.rangeCount) {
      document.execCommand("insertHTML", false, html)
      return
    }

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const template = document.createElement("template")
    template.innerHTML = html
    const fragment = template.content

    const lastNode = fragment.lastChild
    range.insertNode(fragment)

    if (lastNode) {
      range.setStartAfter(lastNode)
      range.setEndAfter(lastNode)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  static insertImage(src: string, alt?: string): void {
    const safeAlt = alt ? escapeAttr(alt) : ""
    const safeSrc = escapeAttr(src)
    this.insertHTML(`<img src="${safeSrc}" alt="${safeAlt}" />`)
  }

  static insertTable(rows: number, cols: number): void {
    const r = Math.max(1, Math.min(rows, 50))
    const c = Math.max(1, Math.min(cols, 20))
    let html = "<table><thead><tr>"
    for (let j = 0; j < c; j++) html += "<th>&nbsp;</th>"
    html += "</tr></thead><tbody>"
    for (let i = 0; i < r - 1; i++) {
      html += "<tr>"
      for (let j = 0; j < c; j++) html += "<td>&nbsp;</td>"
      html += "</tr>"
    }
    html += "</tbody></table><p><br /></p>"
    this.insertHTML(html)
  }

  static createLink(url: string, text?: string): void {
    if (!isClient()) return
    const safeUrl = escapeAttr(url)
    const selection = window.getSelection()
    const hasSelection = !!selection?.toString()

    if (hasSelection && !text) {
      this.execCommand("createLink", url)
      // Add target/rel to the newly created anchor
      const anchor = selection?.anchorNode?.parentElement?.closest("a")
      if (anchor) {
        anchor.setAttribute("target", "_blank")
        anchor.setAttribute("rel", "noopener noreferrer")
      }
    } else {
      const label = text ? escapeAttr(text) : safeUrl
      this.insertHTML(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    }
  }

  static insertChecklist(): void {
    this.insertHTML('<ul data-type="task"><li data-checked="false">&nbsp;</li></ul>')
  }

  static insertHorizontalRule(): void {
    this.execCommand("insertHorizontalRule")
  }

  static setFontSize(size: string): void {
    this.execCommand("fontSize", size)
  }

  static setFontName(name: string): void {
    this.execCommand("fontName", name)
  }

  static setForeColor(color: string): void {
    this.execCommand("foreColor", color)
  }

  static setBackColor(color: string): void {
    // Browsers differ on backColor vs hiliteColor
    if (!this.execCommand("hiliteColor", color)) {
      this.execCommand("backColor", color)
    }
  }

  static indent(): void {
    this.execCommand("indent")
  }

  static outdent(): void {
    this.execCommand("outdent")
  }

  static stats(html: string): EditorStats {
    const text = this.extractText(html).trim()
    if (!text) return { characters: 0, charactersNoSpaces: 0, words: 0 }
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, "").length,
      words: text.split(/\s+/).filter(Boolean).length,
    }
  }

  static extractText(html: string): string {
    if (!isClient()) return html.replace(/<[^>]*>/g, "")
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || ""
  }
}
