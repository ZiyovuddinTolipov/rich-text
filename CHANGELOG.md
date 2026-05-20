# Changelog

## 2.2.1 — 2026-05-20

### Fixed

- **Inline styles preserved across copy/paste**. Sanitizer now allows the `style` attribute by default and filters values through a new `sanitizeStyle` util — blocks `mso-*`, `expression()`, `javascript:`, `behavior:`, `binding:`, `@import`, and `position: fixed|absolute`; keeps color, background, font-size, font-family, font-weight, text-decoration, padding, margin, border, etc. Toolbar foreColor/backColor/fontSize now survive subsequent input events and round-trip copy-paste.
- **Paste cleanup keeps semantic styling**. `cleanPastedHtml` filters `style` through the same util instead of dropping it; `data-type` and `data-checked` (task lists) are preserved; `hasSemanticStyle` recognizes color, background, font-size, font-family, letter-spacing, line-height in addition to bold/italic/underline.
- **Paste image into editor**. Editor is refocused after the async `FileReader` / `onImageUpload` so `EditorCommands.insertImage` runs against a live selection.
- **Side-by-side images**. `insertImage` now uses `document.execCommand("insertHTML")` so images insert as inline content instead of splitting the block container.
- **Copy image from editor**. `.rte-surface img` gets `display: inline`, `user-select: text`, `-webkit-user-select: text` so images are selectable and copyable.
- **Image resize tracks the image during drag**. The overlay box now recomputes on every `mousemove`, so handles stay on the corners while the image shrinks instead of drifting off.

## 2.2.0 — 2026-05-20

### Added — Productivity

- **Find & Replace** (`findReplace` prop). Press `Ctrl/Cmd+F` to open the popup. Live highlight, prev/next navigation, case toggle, replace one / replace all.
- **Autosave** (`autosave` prop). Debounced save callback that fires after the editor has been quiet (default 1500 ms). Identical content is skipped automatically.
- **Word / Google Docs paste cleanup** (`cleanPaste` prop, default `true`). Strips MSO conditional comments, XML namespaces, `mso-*` styles, empty spans, and other clutter when pasting from Microsoft Word, Google Docs, or Apple Pages.
- **Image drag-resize** (`imageResize` prop). Click an image to reveal four corner handles. Aspect ratio is preserved; sizes are promoted to sanitizer-safe `width`/`height` attributes.
- **Dirty tracking**. New ref methods `isDirty()` and `markClean()`, plus `onDirtyChange(isDirty)` callback. Uses FNV-1a hashing so it stays cheap on large documents.
- New ref methods: `openFindReplace()`, `closeFindReplace()`.
- New exports: `FindReplace`, `ImageResizer`, `createAutosaveScheduler`, `hashString`, `isDirtyAgainst`, `cleanPastedHtml`, `isExternalPaste`, `looksLikeWordPaste`, `looksLikeGoogleDocsPaste`, `looksLikeApplePages`, type `AutosaveConfig`.

### Changed

- Sanitizer now allows `<mark>` (used by Find & Replace highlights) and the `width` / `height` attributes (used by image resize).

## 2.1.0 — 2026-05-18

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
