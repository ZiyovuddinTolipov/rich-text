export class HTMLSanitizer {
  private static allowedTags = [
    "p",
    "div",
    "span",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "code",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "hr",
  ]

  private static allowedAttributes = [
    "href",
    "src",
    "alt",
    "title",
    "target",
    "style",
    "class",
    "colspan",
    "rowspan",
    "border",
    "cellpadding",
    "cellspacing",
  ]

  static sanitize(html: string): string {
    const div = document.createElement("div")
    div.innerHTML = html

    this.cleanNode(div)
    return div.innerHTML
  }

  private static cleanNode(node: Node): void {
    const children = Array.from(node.childNodes)

    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element

        if (!this.allowedTags.includes(element.tagName.toLowerCase())) {
          // Replace with span or remove
          const span = document.createElement("span")
          span.innerHTML = element.innerHTML
          element.parentNode?.replaceChild(span, element)
          this.cleanNode(span)
        } else {
          // Clean attributes
          const attributes = Array.from(element.attributes)
          attributes.forEach((attr) => {
            if (!this.allowedAttributes.includes(attr.name.toLowerCase())) {
              element.removeAttribute(attr.name)
            }
          })

          this.cleanNode(element)
        }
      }
    })
  }

  static extractText(html: string): string {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }
}
