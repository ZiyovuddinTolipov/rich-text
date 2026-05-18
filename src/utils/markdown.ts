/**
 * Minimal HTML → Markdown converter. Covers the tags supported by the
 * editor (headings, lists, emphasis, links, images, blockquotes, code,
 * tables, hr, task lists). Not a full GFM converter.
 */

const BLOCK = new Set(["P", "DIV", "BLOCKQUOTE", "PRE", "UL", "OL", "LI", "HR", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE"])

function escapeMd(text: string): string {
  return text.replace(/([\\`*_{}\[\]()#+\-.!])/g, "\\$1")
}

function walk(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMd(node.textContent ?? "")
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ""
  const el = node as Element
  const tag = el.tagName

  const childrenMd = Array.from(el.childNodes).map(walk).join("")

  switch (tag) {
    case "BR":
      return "  \n"
    case "STRONG":
    case "B":
      return `**${childrenMd}**`
    case "EM":
    case "I":
      return `*${childrenMd}*`
    case "S":
    case "STRIKE":
      return `~~${childrenMd}~~`
    case "U":
      return `<u>${childrenMd}</u>`
    case "CODE":
      if (el.parentElement?.tagName === "PRE") return childrenMd
      return `\`${el.textContent ?? ""}\``
    case "PRE": {
      const code = el.textContent ?? ""
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`
    }
    case "A": {
      const href = el.getAttribute("href") ?? ""
      return `[${childrenMd}](${href})`
    }
    case "IMG": {
      const src = el.getAttribute("src") ?? ""
      const alt = el.getAttribute("alt") ?? ""
      return `![${alt}](${src})`
    }
    case "H1": return `\n# ${childrenMd}\n\n`
    case "H2": return `\n## ${childrenMd}\n\n`
    case "H3": return `\n### ${childrenMd}\n\n`
    case "H4": return `\n#### ${childrenMd}\n\n`
    case "H5": return `\n##### ${childrenMd}\n\n`
    case "H6": return `\n###### ${childrenMd}\n\n`
    case "P": return `\n${childrenMd}\n\n`
    case "BLOCKQUOTE":
      return childrenMd.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n") + "\n\n"
    case "HR": return "\n---\n\n"
    case "UL": {
      const taskMode = el.getAttribute("data-type") === "task"
      const items = Array.from(el.children).map((li) => {
        const checked = li.getAttribute("data-checked") === "true"
        const md = walk(li).trim()
        if (taskMode) return `- [${checked ? "x" : " "}] ${md}`
        return `- ${md}`
      })
      return `\n${items.join("\n")}\n\n`
    }
    case "OL": {
      const items = Array.from(el.children).map((li, i) => `${i + 1}. ${walk(li).trim()}`)
      return `\n${items.join("\n")}\n\n`
    }
    case "LI":
      return childrenMd
    case "TABLE": {
      const rows = Array.from(el.querySelectorAll("tr"))
      if (rows.length === 0) return ""
      const header = rows[0]
      const headerCells = Array.from(header.children).map((c) => walk(c).trim() || " ")
      const separator = headerCells.map(() => "---")
      const bodyRows = rows.slice(1).map((r) =>
        Array.from(r.children).map((c) => walk(c).trim() || " "),
      )
      const out: string[] = []
      out.push(`| ${headerCells.join(" | ")} |`)
      out.push(`| ${separator.join(" | ")} |`)
      for (const row of bodyRows) out.push(`| ${row.join(" | ")} |`)
      return `\n${out.join("\n")}\n\n`
    }
    default:
      return childrenMd
  }
}

export function htmlToMarkdown(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }
  const div = document.createElement("div")
  div.innerHTML = html
  const md = Array.from(div.childNodes).map(walk).join("")
  return md.replace(/\n{3,}/g, "\n\n").trim()
}

export { BLOCK as BLOCK_TAGS }
