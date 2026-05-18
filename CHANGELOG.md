# Changelog

## 2.1.0 — Unreleased

### Added — Notion-style UX

- **Slash command menu** (`slashMenu` prop). Type `/` to open a popup of block-level commands (headings, lists, code, table, divider…). Supply your own commands as `SlashCommand[]`.
- **Markdown shortcuts** (`markdownShortcuts` prop). Typing patterns convert on the fly:
  - Inline: `**bold**`, `__bold__`, `*italic*`, `_italic_`, `~~strike~~`, `` `code` ``
  - Block (at start of line + space): `#`–`######` headings, `>` blockquote, `-`/`*` bullet list, `1.` numbered list, `[]` task list, `---` divider, ` ``` ` code block.
- **Bubble toolbar** (`bubbleToolbar` prop). Floating toolbar appears above any text selection with bold/italic/underline/link/quote. Pass `BubbleItem[]` to customize.
- New exports: `SlashMenu`, `BubbleToolbar`, `DEFAULT_SLASH_COMMANDS`, `filterSlashCommands`, `applyMarkdownShortcut`, types `SlashCommand`, `BubbleItem`.

## 2.0.0 — 2026-05-18

### BREAKING

- **Removed Tailwind dependency.** Consumers no longer need Tailwind configured. Import `@tolipovjs/rich-text/styles.css` once in the app entry.
- Removed `apiKey` prop (was unused).
- `theme` prop now actually applies (previously a no-op).
- Sanitizer no longer allows `style` attribute by default. Opt in with `HTMLSanitizer.sanitize(html, { allowStyle: true })`.
- `<RichTextEditor>` is now a `forwardRef` component. Consumers that wrapped the element in a `<div ref>` and used DOM queries should migrate to the new imperative API.

### Added

- CSS-variable theme tokens (`--rte-*`). Override any of them to restyle.
- `theme` prop: `"light" | "dark" | "auto"` (auto follows `prefers-color-scheme`).
- Imperative ref API: `focus`, `blur`, `clear`, `getHTML`, `setHTML`, `insertHTML`, `getText`, `execCommand`, `getStats`.
- `toolbar` prop accepts presets (`"all"`, `"basic"`, `"minimal"`) or an array of built-in IDs.
- `customButtons` prop to append custom toolbar buttons.
- `onImageUpload` prop — async server-side image upload handler.
- `readOnly`, `maxLength`, `autoFocus`, `showStats`, `allowHtmlMode`, `minHeight` props.
- `onFocus`, `onBlur`, `onSelectionChange` event hooks.
- Subscript / superscript / indent / outdent toolbar buttons.
- Checklist (task list) toolbar button + interactive checkboxes.
- Word/character counter (`showStats`).
- Lightweight undo/redo history stack (Ctrl/Cmd + Z/Y).
- `htmlToMarkdown()` utility.
- `HistoryStack`, `RichTextEditorContext`, `useRichTextEditor` exports.
- Vitest test suite covering sanitizer, markdown, commands, history.
- Playground example at `examples/playground/`.

### Changed

- Hardened sanitizer:
  - Drops `style` attribute by default.
  - Blocks `javascript:`, `vbscript:`, and non-image `data:` URLs.
  - Strips all `on*` event handlers.
  - Adds `rel="noopener noreferrer"` to `target="_blank"` links.
  - Removes `<script>`, `<iframe>`, `<object>`, `<embed>` outright.
- Inserted images no longer carry inline `style`.
- Inserted tables use semantic `<thead>` / `<tbody>` with the first row as header.
- SSR safe: every `document` / `window` access is guarded.
- Package exports include both ESM and CJS plus `"./styles.css"` subpath.

### Removed

- Inline `<style>` block per editor instance (was duplicated DOM).
- `apiKey` prop.

## 1.0.1

Initial public release.
