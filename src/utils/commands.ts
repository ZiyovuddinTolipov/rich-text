export class EditorCommands {
  static execCommand(command: string, value?: string): boolean {
    try {
      return document.execCommand(command, false, value)
    } catch (error) {
      console.warn("Command execution failed:", command, error)
      return false
    }
  }

  static queryCommandState(command: string): boolean {
    try {
      return document.queryCommandState(command)
    } catch (error) {
      return false
    }
  }

  static queryCommandValue(command: string): string {
    try {
      return document.queryCommandValue(command)
    } catch (error) {
      return ""
    }
  }

  static insertHTML(html: string): void {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const div = document.createElement("div")
    div.innerHTML = html

    const fragment = document.createDocumentFragment()
    let node
    while ((node = div.firstChild)) {
      fragment.appendChild(node)
    }

    range.insertNode(fragment)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  static insertImage(src: string, alt?: string): void {
    const img = `<img src="${src}" alt="${alt || ""}" style="max-width: 100%; height: auto;" />`
    this.insertHTML(img)
  }

  static insertTable(rows: number, cols: number): void {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">'

    for (let i = 0; i < rows; i++) {
      tableHTML += "<tr>"
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>'
      }
      tableHTML += "</tr>"
    }

    tableHTML += "</table><p>&nbsp;</p>"
    this.insertHTML(tableHTML)
  }

  static createLink(url: string, text?: string): void {
    const selection = window.getSelection()
    if (!selection?.toString() && !text) {
      text = url
    }

    if (text) {
      this.insertHTML(`<a href="${url}" target="_blank">${text}</a>`)
    } else {
      this.execCommand("createLink", url)
    }
  }

  static setFontSize(size: string): void {
    this.execCommand("fontSize", size)
  }

  static setForeColor(color: string): void {
    this.execCommand("foreColor", color)
  }

  static setBackColor(color: string): void {
    this.execCommand("backColor", color)
  }
}
