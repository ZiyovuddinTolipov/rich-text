import { EditorCommands } from "./commands"
import type { SlashCommand } from "../types"

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1",
    description: "Big section heading",
    keywords: ["h1", "title", "header"],
    run: () => EditorCommands.execCommand("formatBlock", "<h1>"),
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Medium section heading",
    keywords: ["h2", "subheader"],
    run: () => EditorCommands.execCommand("formatBlock", "<h2>"),
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Small section heading",
    keywords: ["h3"],
    run: () => EditorCommands.execCommand("formatBlock", "<h3>"),
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text",
    keywords: ["p", "text", "body"],
    run: () => EditorCommands.execCommand("formatBlock", "<p>"),
  },
  {
    id: "ul",
    label: "Bullet list",
    description: "Unordered list",
    keywords: ["ul", "list", "bullet"],
    run: () => EditorCommands.execCommand("insertUnorderedList"),
  },
  {
    id: "ol",
    label: "Numbered list",
    description: "Ordered list",
    keywords: ["ol", "list", "numbered"],
    run: () => EditorCommands.execCommand("insertOrderedList"),
  },
  {
    id: "task",
    label: "Task list",
    description: "Checklist with checkboxes",
    keywords: ["todo", "check", "task"],
    run: () => EditorCommands.insertChecklist(),
  },
  {
    id: "quote",
    label: "Quote",
    description: "Blockquote",
    keywords: ["quote", "blockquote", "citation"],
    run: () => EditorCommands.execCommand("formatBlock", "<blockquote>"),
  },
  {
    id: "code",
    label: "Code block",
    description: "Monospaced code",
    keywords: ["code", "pre", "snippet"],
    run: () => EditorCommands.execCommand("formatBlock", "<pre>"),
  },
  {
    id: "hr",
    label: "Divider",
    description: "Horizontal rule",
    keywords: ["hr", "divider", "separator", "line"],
    run: () => EditorCommands.insertHorizontalRule(),
  },
  {
    id: "table",
    label: "Table",
    description: "3x3 table",
    keywords: ["table", "grid"],
    run: () => EditorCommands.insertTable(3, 3),
  },
]

export function filterSlashCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  if (!query) return commands
  const q = query.toLowerCase()
  return commands.filter((c) => {
    if (c.label.toLowerCase().includes(q)) return true
    if (c.id.toLowerCase().includes(q)) return true
    if (c.keywords?.some((k) => k.toLowerCase().includes(q))) return true
    return false
  })
}
