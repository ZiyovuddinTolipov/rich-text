/**
 * Detects and cleans HTML pasted from Microsoft Word, Google Docs, and Apple Pages.
 * Strips MS Office classes, conditional comments, mso-* styles, empty fragments,
 * and normalizes nested span clutter.
 */

import { sanitizeStyle } from "./styleFilter"

const WORD_MARKERS = [
  /class="?MsoNormal"?/i,
  /class="?Mso[A-Za-z]+"?/i,
  /<!--\[if[^\]]+\]>/i,
  /xmlns:?o=/i,
  /xmlns:?w=/i,
  /urn:schemas-microsoft-com/i,
  /mso-[a-z-]+\s*:/i,
]

const GDOCS_MARKERS = [
  /id="?docs-internal-guid-/i,
  /class="?docs-internal-guid-/i,
]

const PAGES_MARKERS = [/class="?s\d+"?[^>]*style="[^"]*-apple-/i]

export function looksLikeWordPaste(html: string): boolean {
  return WORD_MARKERS.some((re) => re.test(html))
}

export function looksLikeGoogleDocsPaste(html: string): boolean {
  return GDOCS_MARKERS.some((re) => re.test(html))
}

export function looksLikeApplePages(html: string): boolean {
  return PAGES_MARKERS.some((re) => re.test(html))
}

export function isExternalPaste(html: string): boolean {
  return (
    looksLikeWordPaste(html) ||
    looksLikeGoogleDocsPaste(html) ||
    looksLikeApplePages(html)
  )
}

/**
 * Aggressively clean pasted HTML. Removes:
 * - Conditional comments and XML namespaces
 * - `class`, `id`, `lang`, `style`, `data-*` attributes
 * - Empty `<span>` wrappers and redundant nesting
 * - `<o:p>`, `<v:*>`, `<w:*>`, and other VML/MS-specific tags
 * - Word-specific `Mso` paragraph classes
 */
export function cleanPastedHtml(html: string): string {
  if (typeof document === "undefined") return stripWithRegex(html)

  // Strip conditional comments and XML namespaces before parsing
  let cleaned = html
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<\/?(o|v|w|st\d):[a-zA-Z0-9]+[^>]*>/gi, "")

  const doc = new DOMParser().parseFromString(`<div>${cleaned}</div>`, "text/html")
  const root = doc.body.firstElementChild as HTMLElement | null
  if (!root) return ""

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const toUnwrap: Element[] = []
  const toRemove: Element[] = []

  let node: Node | null = walker.currentNode
  while (node) {
    if (node instanceof Element) {
      const tag = node.tagName.toLowerCase()

      // Drop entire tags Word/GDocs sprinkle in
      if (tag === "meta" || tag === "link" || tag === "style" || tag === "script") {
        toRemove.push(node)
      } else if (tag === "font") {
        toUnwrap.push(node)
      } else if (tag === "span" && !hasSemanticStyle(node)) {
        toUnwrap.push(node)
      } else {
        // Strip noise attributes
        const attrs = Array.from(node.attributes)
        for (const a of attrs) {
          const name = a.name.toLowerCase()
          if (
            name === "class" ||
            name === "id" ||
            name === "lang" ||
            name.startsWith("aria-") ||
            name === "dir" ||
            name === "align" ||
            (name.startsWith("data-") && name !== "data-type" && name !== "data-checked")
          ) {
            node.removeAttribute(a.name)
          } else if (name === "style") {
            const cleaned = sanitizeStyle(a.value)
            if (cleaned) {
              node.setAttribute("style", cleaned)
            } else {
              node.removeAttribute("style")
            }
          }
        }
      }
    }
    node = walker.nextNode()
  }

  toRemove.forEach((el) => el.remove())
  toUnwrap.forEach((el) => unwrap(el))

  // Collapse double whitespace inside text nodes
  const textWalker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let textNode = textWalker.nextNode() as Text | null
  while (textNode) {
    textNode.data = textNode.data.replace(/[ \t]+/g, " ").replace(/\u00A0/g, " ")
    textNode = textWalker.nextNode() as Text | null
  }

  return root.innerHTML.replace(/<p>\s*<\/p>/gi, "").replace(/&nbsp;/gi, " ")
}

function hasSemanticStyle(el: Element): boolean {
  const style = el.getAttribute("style") || ""
  return /font-weight|font-style|text-decoration|color|background|font-size|font-family|letter-spacing|line-height/i.test(style)
}

function unwrap(el: Element) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

// Fallback when no DOM (SSR/test): regex-only cleanup
function stripWithRegex(html: string): string {
  return html
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<\/?(o|v|w|st\d):[a-zA-Z0-9]+[^>]*>/gi, "")
    .replace(/<(meta|link|style|script)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(meta|link)[^>]*\/?>/gi, "")
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/\sid="[^"]*"/gi, "")
    .replace(/\slang="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*mso-[^"]*"/gi, "")
    .replace(/\sstyle=""/gi, "")
}
