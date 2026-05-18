const BLOCK_TAGS = /^(P|DIV|H[1-6]|LI|BLOCKQUOTE|PRE)$/

function findBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let cur: Node | null = node
  while (cur && cur !== root) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const el = cur as HTMLElement
      if (BLOCK_TAGS.test(el.tagName)) return el
    }
    cur = cur.parentNode
  }
  return null
}

function textBeforeInBlock(textNode: Text, offset: number, block: HTMLElement): string {
  const range = document.createRange()
  range.setStart(block, 0)
  range.setEnd(textNode, offset)
  return range.toString()
}

function placeCaretAtStart(el: HTMLElement): void {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function placeCaretAtEnd(el: HTMLElement): void {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

interface InlineMatch {
  start: number
  end: number
  inner: string
  tag: string
}

const INLINE_PATTERNS: { re: RegExp; tag: string }[] = [
  { re: /\*\*([^*\n]+)\*\*$/, tag: "strong" },
  { re: /__([^_\n]+)__$/, tag: "strong" },
  { re: /(?<![*\w])\*([^*\s][^*\n]*?)\*$/, tag: "em" },
  { re: /(?<![_\w])_([^_\s][^_\n]*?)_$/, tag: "em" },
  { re: /~~([^~\n]+)~~$/, tag: "del" },
  { re: /`([^`\n]+)`$/, tag: "code" },
]

function matchInline(before: string): InlineMatch | null {
  for (const { re, tag } of INLINE_PATTERNS) {
    const m = before.match(re)
    if (m && m.index != null) {
      return { start: m.index, end: m.index + m[0].length, inner: m[1], tag }
    }
  }
  return null
}

function applyInline(textNode: Text, _offset: number, match: InlineMatch): void {
  const range = document.createRange()
  range.setStart(textNode, match.start)
  range.setEnd(textNode, match.end)
  range.deleteContents()

  const el = document.createElement(match.tag)
  el.textContent = match.inner
  range.insertNode(el)

  const space = document.createTextNode("\u00a0")
  el.after(space)

  const sel = window.getSelection()
  if (!sel) return
  const newRange = document.createRange()
  newRange.setStartAfter(space)
  newRange.collapse(true)
  sel.removeAllRanges()
  sel.addRange(newRange)
}

type BlockKind =
  | { kind: "heading"; level: number }
  | { kind: "blockquote" }
  | { kind: "ul" }
  | { kind: "ol" }
  | { kind: "task" }
  | { kind: "hr" }
  | { kind: "codeblock" }

function matchBlock(text: string): { trigger: string; spec: BlockKind } | null {
  if (/^#{1,6}$/.test(text)) {
    return { trigger: text, spec: { kind: "heading", level: text.length } }
  }
  if (text === ">") return { trigger: text, spec: { kind: "blockquote" } }
  if (text === "-" || text === "*") return { trigger: text, spec: { kind: "ul" } }
  if (text === "1.") return { trigger: text, spec: { kind: "ol" } }
  if (text === "[]" || text === "[ ]") return { trigger: text, spec: { kind: "task" } }
  if (text === "---") return { trigger: text, spec: { kind: "hr" } }
  if (text === "```") return { trigger: text, spec: { kind: "codeblock" } }
  return null
}

function removeFromBlockStart(block: HTMLElement, n: number): void {
  let remaining = n
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const toRemove: Text[] = []
  let next = walker.nextNode() as Text | null
  while (next && remaining > 0) {
    const len = next.length
    if (len <= remaining) {
      remaining -= len
      toRemove.push(next)
    } else {
      next.deleteData(0, remaining)
      remaining = 0
    }
    next = walker.nextNode() as Text | null
  }
  toRemove.forEach((t) => t.remove())
}

function applyBlock(block: HTMLElement, match: { trigger: string; spec: BlockKind }): void {
  removeFromBlockStart(block, match.trigger.length)
  const innerHTML = block.innerHTML || "<br>"

  switch (match.spec.kind) {
    case "heading": {
      const h = document.createElement("h" + match.spec.level)
      h.innerHTML = innerHTML
      block.replaceWith(h)
      placeCaretAtStart(h)
      return
    }
    case "blockquote": {
      const bq = document.createElement("blockquote")
      const p = document.createElement("p")
      p.innerHTML = innerHTML
      bq.appendChild(p)
      block.replaceWith(bq)
      placeCaretAtStart(p)
      return
    }
    case "ul":
    case "ol": {
      const list = document.createElement(match.spec.kind)
      const li = document.createElement("li")
      li.innerHTML = innerHTML
      list.appendChild(li)
      block.replaceWith(list)
      placeCaretAtStart(li)
      return
    }
    case "task": {
      const ul = document.createElement("ul")
      ul.setAttribute("data-type", "task")
      const li = document.createElement("li")
      li.setAttribute("data-checked", "false")
      li.innerHTML = innerHTML
      ul.appendChild(li)
      block.replaceWith(ul)
      placeCaretAtStart(li)
      return
    }
    case "hr": {
      const hr = document.createElement("hr")
      const p = document.createElement("p")
      p.innerHTML = "<br>"
      block.replaceWith(hr)
      hr.after(p)
      placeCaretAtStart(p)
      return
    }
    case "codeblock": {
      const pre = document.createElement("pre")
      const code = document.createElement("code")
      code.innerHTML = innerHTML
      pre.appendChild(code)
      block.replaceWith(pre)
      placeCaretAtEnd(code)
      return
    }
  }
}

export function applyMarkdownShortcut(e: KeyboardEvent, root: HTMLElement): boolean {
  if (e.key !== " ") return false
  if (typeof window === "undefined" || typeof document === "undefined") return false

  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false
  const range = sel.getRangeAt(0)
  const node = range.startContainer
  if (node.nodeType !== Node.TEXT_NODE) return false
  if (!root.contains(node)) return false

  const textNode = node as Text
  const offset = range.startOffset
  const before = textNode.data.slice(0, offset)

  const inline = matchInline(before)
  if (inline) {
    e.preventDefault()
    applyInline(textNode, offset, inline)
    return true
  }

  const block = findBlock(textNode, root)
  if (!block) return false
  if (block.tagName === "PRE") return false

  const beforeInBlock = textBeforeInBlock(textNode, offset, block)
  const blockMatch = matchBlock(beforeInBlock)
  if (blockMatch) {
    e.preventDefault()
    applyBlock(block, blockMatch)
    return true
  }

  return false
}

export const __test = {
  matchInline,
  matchBlock,
  findBlock,
  removeFromBlockStart,
}
