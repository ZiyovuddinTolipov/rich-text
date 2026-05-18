import type { SanitizeOptions } from "../types"

const DEFAULT_ALLOWED_TAGS = [
  "p", "div", "span", "br",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "blockquote", "pre", "code",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "td", "th",
  "hr",
]

const DEFAULT_ALLOWED_ATTRS = [
  "href", "src", "alt", "title", "target", "rel",
  "class", "colspan", "rowspan",
  "data-type", "data-checked",
]

const URL_ATTR = new Set(["href", "src"])
const SAFE_URL_RE = /^(?:https?:|mailto:|tel:|ftp:|#|\/)/i
const IMAGE_DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,/i

function isSafeUrl(attrName: string, value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (SAFE_URL_RE.test(trimmed)) return true
  if (attrName === "src" && IMAGE_DATA_URL_RE.test(trimmed)) return true
  return false
}

export class HTMLSanitizer {
  static sanitize(html: string, opts: SanitizeOptions = {}): string {
    if (typeof document === "undefined") return html

    const allowedTags = new Set([...DEFAULT_ALLOWED_TAGS, ...(opts.extraTags ?? [])])
    const allowedAttrs = new Set([...DEFAULT_ALLOWED_ATTRS, ...(opts.extraAttributes ?? [])])
    if (opts.allowStyle) allowedAttrs.add("style")

    const div = document.createElement("div")
    div.innerHTML = html

    this.cleanNode(div, allowedTags, allowedAttrs)
    return div.innerHTML
  }

  private static cleanNode(
    node: Node,
    allowedTags: Set<string>,
    allowedAttrs: Set<string>,
  ): void {
    const children = Array.from(node.childNodes)

    children.forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return
      const element = child as Element
      const tag = element.tagName.toLowerCase()

      if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object" || tag === "embed") {
        element.remove()
        return
      }

      if (!allowedTags.has(tag)) {
        const span = document.createElement("span")
        span.innerHTML = element.innerHTML
        element.parentNode?.replaceChild(span, element)
        this.cleanNode(span, allowedTags, allowedAttrs)
        return
      }

      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase()

        if (name.startsWith("on")) {
          element.removeAttribute(attr.name)
          return
        }

        if (!allowedAttrs.has(name)) {
          element.removeAttribute(attr.name)
          return
        }

        if (URL_ATTR.has(name) && !isSafeUrl(name, attr.value)) {
          element.removeAttribute(attr.name)
        }
      })

      if (tag === "a" && element.getAttribute("target") === "_blank" && !element.getAttribute("rel")) {
        element.setAttribute("rel", "noopener noreferrer")
      }

      this.cleanNode(element, allowedTags, allowedAttrs)
    })
  }

  static extractText(html: string): string {
    if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "")
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || ""
  }
}
