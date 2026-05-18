# @tolipovjs/rich-text

[![npm version](https://img.shields.io/npm/v/@tolipovjs/rich-text.svg?color=brightgreen)](https://www.npmjs.com/package/@tolipovjs/rich-text)
[![npm downloads](https://img.shields.io/npm/dm/@tolipovjs/rich-text.svg)](https://www.npmjs.com/package/@tolipovjs/rich-text)
[![CI](https://github.com/ZiyovuddinTolipov/rich-text/actions/workflows/ci.yml/badge.svg)](https://github.com/ZiyovuddinTolipov/rich-text/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@tolipovjs/rich-text)](https://bundlephobia.com/package/@tolipovjs/rich-text)
[![types](https://img.shields.io/npm/types/@tolipovjs/rich-text.svg)](https://www.npmjs.com/package/@tolipovjs/rich-text)
[![license](https://img.shields.io/npm/l/@tolipovjs/rich-text.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ZiyovuddinTolipov/rich-text/pulls)
[![Playground](https://img.shields.io/badge/playground-live-ff69b4?logo=vercel)](https://rich-text-website.vercel.app/playground)

A modern, lightweight React rich text editor — **no Tailwind required**, **fully themeable via CSS variables**, with an imperative ref API and a customizable toolbar.

> 🎮 **[Try the live playground →](https://rich-text-website.vercel.app/playground)** · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/ZiyovuddinTolipov/rich-text/tree/main/examples/demo-app?title=@tolipovjs/rich-text&description=Notion-style%20React%20rich%20text%20editor)

> v2.0 is a breaking release. See the [Migration Guide](#migration-from-v1) below.

---

## Why @tolipovjs/rich-text?

| Feature | @tolipovjs/rich-text | TinyMCE | CKEditor 5 | Lexical (Meta) | TipTap | Quill |
|---|---|---|---|---|---|---|
| **Price** | 🟢 Free MIT | 🔴 $79/mo+ (paid plans) | 🔴 $99/mo+ | 🟢 Free MIT | 🟡 Pro $149/mo | 🟢 Free BSD |
| Bundle (minzip) | 🟢 **~22 KB** | 🔴 ~400 KB | 🔴 ~250 KB | 🟢 ~30 KB | 🟡 ~80 KB | 🟡 ~45 KB |
| Notion-style slash menu | 🟢 Built-in | 🔴 Paid plugin | 🔴 Paid plugin | 🟡 DIY | 🟡 Plugin | 🔴 No |
| Markdown shortcuts | 🟢 Built-in | 🔴 Paid plugin | 🟡 Plugin | 🟡 DIY | 🟢 Plugin | 🔴 No |
| Bubble/floating toolbar | 🟢 Built-in | 🟢 Yes | 🟢 Yes | 🟡 DIY | 🟢 Plugin | 🔴 No |
| CSS-variable theming | 🟢 Native | 🟡 Limited | 🟡 SCSS rebuild | 🟡 DIY | 🟡 DIY | 🟡 DIY |
| Dark mode (built-in) | 🟢 Auto + manual | 🟡 Paid plugin | 🟡 Skin | 🟡 DIY | 🟡 DIY | 🔴 DIY |
| HTML sanitizer | 🟢 Built-in | 🟢 Yes | 🟢 Yes | 🟡 DIY | 🟡 DIY | 🟡 Basic |
| HTML → Markdown export | 🟢 Built-in | 🔴 Paid | 🟡 Plugin | 🔴 DIY | 🟢 Plugin | 🔴 DIY |
| TypeScript types | 🟢 First-class | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟡 @types |
| SSR (Next.js) safe | 🟢 Out of box | 🟡 Workarounds | 🟡 Workarounds | 🟢 Yes | 🟢 Yes | 🟡 Workarounds |
| Peer deps | 🟢 `lucide-react` only | 🔴 None (loads CDN) | 🔴 Heavy | 🟢 None | 🟡 ProseMirror suite | 🟢 None |
| API style | 🟢 React idiomatic | 🟡 jQuery-ish | 🟡 Builder | 🟢 React | 🟢 React | 🟡 Imperative |

**TL;DR:** Free, lightweight, batteries-included. Notion UX without paying $99/month.

---

## Highlights

- Zero CSS framework lock-in — ships a single stylesheet you import once.
- Theme via plain CSS custom properties (`--rte-*`).
- Built-in **light**, **dark**, **auto** modes (`prefers-color-scheme`).
- **Notion-style UX** *(v2.1)*: slash command menu, Markdown shortcuts, floating bubble toolbar.
- **Productivity** *(v2.2)*: find &amp; replace (`Ctrl/Cmd+F`), debounced autosave, Word/Google Docs paste cleanup, drag-resize images, dirty-state tracking.
- Imperative `ref` API: `focus()`, `clear()`, `getHTML()`, `setHTML()`, `insertHTML()`, `getText()`, `getStats()`.
- Toolbar customization via presets (`all` / `basic` / `minimal`), built-in IDs, or custom buttons.
- Async server image uploads via `onImageUpload`.
- HTML → Markdown export (`htmlToMarkdown`).
- Built-in undo/redo history stack.
- Hardened HTML sanitizer (no `style`/`onclick`/`javascript:`/raw `data:` by default).
- SSR safe — every `document`/`window` touch is guarded.
- Read-only mode, max length, word/char count, task lists, subscript/superscript, indent/outdent.

---

## Install

```bash
npm i @tolipovjs/rich-text
# or
yarn add @tolipovjs/rich-text
# or
pnpm add @tolipovjs/rich-text
```

Peer deps: `react ^18 || ^19`, `react-dom ^18 || ^19`. No styling library required.

---

## Quick Start

```tsx
import { useState } from "react"
import { RichTextEditor } from "@tolipovjs/rich-text"
import "@tolipovjs/rich-text/styles.css"   // ← import once in your app

export function MyEditor() {
  const [html, setHtml] = useState("<p>Hello world!</p>")
  return <RichTextEditor value={html} onChange={setHtml} />
}
```

That's it — no Tailwind config, no extra setup.

---

## Theming

All visuals are driven by CSS custom properties. Override any of them in your own stylesheet:

```css
/* Custom brand theme */
.my-editor {
  --rte-accent: #ff6b9d;
  --rte-btn-active-bg: #ff6b9d;
  --rte-bg: #fff8fb;
  --rte-radius: 12px;
}
```

```tsx
<RichTextEditor className="my-editor" value={html} onChange={setHtml} />
```

### Dark / Light / Auto

```tsx
<RichTextEditor theme="dark" />     // forced dark
<RichTextEditor theme="light" />    // forced light
<RichTextEditor theme="auto" />     // follow OS preference
```

### Variable reference

| Variable | Purpose |
|---|---|
| `--rte-bg`, `--rte-fg` | Root background / foreground |
| `--rte-muted-fg`, `--rte-placeholder-fg` | Muted text / placeholder |
| `--rte-border`, `--rte-border-strong` | Borders |
| `--rte-surface`, `--rte-surface-elevated` | Editor / popover surfaces |
| `--rte-toolbar-bg`, `--rte-toolbar-fg`, `--rte-toolbar-separator` | Toolbar |
| `--rte-btn-fg`, `--rte-btn-hover-bg`, `--rte-btn-active-bg`, `--rte-btn-active-fg` | Toolbar buttons |
| `--rte-accent`, `--rte-accent-hover`, `--rte-accent-fg` | Primary accent |
| `--rte-input-bg`, `--rte-input-fg`, `--rte-input-border`, `--rte-input-focus` | Form inputs in popovers |
| `--rte-dropdown-bg`, `--rte-dropdown-border`, `--rte-dropdown-shadow` | Popovers |
| `--rte-code-bg`, `--rte-code-fg` | `<code>` / `<pre>` |
| `--rte-quote-border`, `--rte-quote-fg` | `<blockquote>` |
| `--rte-table-border`, `--rte-table-header-bg` | Tables |
| `--rte-image-outline` | Image hover outline |
| `--rte-radius`, `--rte-radius-sm`, `--rte-radius-md` | Corner radii |
| `--rte-font-family`, `--rte-font-mono` | Fonts |
| `--rte-min-height` | Editor surface min height |
| `--rte-toolbar-gap`, `--rte-toolbar-padding` | Toolbar spacing |

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `""` | Controlled HTML content |
| `onChange` | `(html: string) => void` | — | Fires on sanitized content change |
| `placeholder` | `string` | `"Start typing..."` | Empty-state text |
| `className` | `string` | `""` | Extra class on root |
| `style` | `React.CSSProperties` | — | Inline style on root |
| `disabled` | `boolean` | `false` | Disable + grey out |
| `readOnly` | `boolean` | `false` | View-only (no editing) |
| `theme` | `"light" \| "dark" \| "auto"` | `"light"` | Theme |
| `toolbar` | `"all" \| "basic" \| "minimal" \| ToolbarItem[]` | `"all"` | Toolbar layout |
| `customButtons` | `ToolbarButtonConfig[]` | — | Append custom buttons |
| `onImageUpload` | `(file: File) => Promise<string>` | — | Async upload — return final URL |
| `autoFocus` | `boolean` | `false` | Focus editor on mount |
| `maxLength` | `number` | — | Hard cap on character count |
| `textColorPresets` | `string[]` | 24 defaults | Override text color swatches |
| `backgroundColorPresets` | `string[]` | 24 defaults | Override BG color swatches |
| `minHeight` | `string` | `"300px"` | CSS min-height for surface |
| `showStats` | `boolean` | `false` | Show word/char count |
| `allowHtmlMode` | `boolean` | `true` | Allow Visual ↔ HTML toggle |
| `onFocus`, `onBlur`, `onSelectionChange` | `() => void` | — | Lifecycle hooks |
| `slashMenu` | `boolean \| SlashCommand[]` | `false` | Enable `/` command popup. `true` for defaults, or supply custom commands. |
| `markdownShortcuts` | `boolean` | `false` | Convert `**bold**`, `# heading`, `- list`, `> quote`, `` `code` ``, `---`, `` ``` `` on the fly. |
| `bubbleToolbar` | `boolean \| BubbleItem[]` | `false` | Floating toolbar above text selection. |
| `findReplace` | `boolean` | `false` | Enable Ctrl/Cmd+F find &amp; replace popup. |
| `autosave` | `AutosaveConfig` | — | `{ interval?, onSave, onError? }` — debounced save when content settles. |
| `cleanPaste` | `boolean` | `true` | Clean up pasted HTML from Word / Google Docs / Apple Pages. |
| `imageResize` | `boolean` | `false` | Click an image to reveal drag-resize handles. |
| `onAutosave` | `(html: string) => void` | — | Fires after every debounced autosave. |
| `onDirtyChange` | `(isDirty: boolean) => void` | — | Fires when dirty state flips. |

---

## Toolbar Customization

### Presets

```tsx
<RichTextEditor toolbar="minimal" />
<RichTextEditor toolbar="basic" />
<RichTextEditor toolbar="all" />
```

### Build your own from built-in IDs

```tsx
<RichTextEditor
  toolbar={[
    "undo", "redo", "|",
    "bold", "italic", "underline", "|",
    "heading", "|",
    "link", "image",
  ]}
/>
```

### Built-in toolbar IDs

`undo` · `redo` · `heading` · `paragraph` · `bold` · `italic` · `underline` · `strike` · `sub` · `sup` · `colorText` · `colorBg` · `alignLeft` · `alignCenter` · `alignRight` · `alignJustify` · `ul` · `ol` · `checklist` · `indent` · `outdent` · `quote` · `code` · `codeblock` · `hr` · `link` · `image` · `table` · `clear` · `|` (separator)

### Add your own button

```tsx
import { Sparkles } from "lucide-react"

<RichTextEditor
  customButtons={[
    {
      id: "ai",
      title: "AI assist",
      icon: <Sparkles size={16} />,
      onClick: () => console.log("✨"),
    },
  ]}
/>
```

---

## Notion-style UX (v2.1)

Opt in to slash commands, Markdown shortcuts, and a floating selection toolbar:

```tsx
<RichTextEditor
  slashMenu             // type "/" to open the command palette
  markdownShortcuts     // **bold**, # heading, - list, > quote, ---
  bubbleToolbar         // floating toolbar on text selection
/>
```

### Custom slash commands

```tsx
import { DEFAULT_SLASH_COMMANDS, type SlashCommand } from "@tolipovjs/rich-text"
import { Sparkles } from "lucide-react"

const ai: SlashCommand = {
  id: "ai",
  label: "AI continue",
  description: "Let the model finish this sentence",
  icon: <Sparkles size={16} />,
  keywords: ["ai", "continue"],
  run: () => doAiStuff(),
}

<RichTextEditor slashMenu={[ai, ...DEFAULT_SLASH_COMMANDS]} />
```

### Custom bubble toolbar items

```tsx
<RichTextEditor bubbleToolbar={["bold", "italic", "code", "|", "h1", "h2", "link"]} />
```

## Productivity (v2.2)

```tsx
<RichTextEditor
  findReplace                                 // Ctrl/Cmd+F → popup
  imageResize                                 // click image → corner drag handles
  cleanPaste                                  // strip Word/Google Docs clutter (default true)
  autosave={{
    interval: 1500,                           // debounce window in ms
    onSave: (html) => fetch("/draft", { method: "PUT", body: html }),
    onError: (err) => console.error(err),
  }}
  onDirtyChange={(dirty) => setUnsavedBadge(dirty)}
/>
```

### Dirty tracking

```tsx
const ref = useRef<RichTextEditorHandle>(null)

// After successful save:
await api.save(ref.current!.getHTML())
ref.current!.markClean()

// Check from anywhere:
if (ref.current!.isDirty()) warnBeforeNavigate()
```

### Open find &amp; replace programmatically

```tsx
ref.current?.openFindReplace()
ref.current?.closeFindReplace()
```

### Paste cleanup

When `cleanPaste` is enabled (default), pasted HTML from Word, Google Docs, or Apple Pages is run through `cleanPastedHtml()` before being inserted. MSO conditional comments, `mso-*` styles, XML namespaces, empty spans and font tags are stripped. Plain pastes from the same editor or simple text are left alone.

## Imperative API (ref)

```tsx
import { useRef } from "react"
import { RichTextEditor, type RichTextEditorHandle } from "@tolipovjs/rich-text"

function Editor() {
  const ref = useRef<RichTextEditorHandle>(null)

  return (
    <>
      <button onClick={() => ref.current?.focus()}>Focus</button>
      <button onClick={() => ref.current?.clear()}>Clear</button>
      <button onClick={() => console.log(ref.current?.getHTML())}>Log HTML</button>
      <button onClick={() => console.log(ref.current?.getStats())}>Word count</button>
      <RichTextEditor ref={ref} />
    </>
  )
}
```

**Methods:** `focus()` · `blur()` · `clear()` · `getHTML()` · `setHTML(html)` · `insertHTML(html)` · `getText()` · `execCommand(cmd, value?)` · `getStats()` · `isDirty()` · `markClean()` · `openFindReplace()` · `closeFindReplace()`

---

## Image Uploads

By default, pasted/inserted images become base64 data URLs. Replace with a server upload:

```tsx
<RichTextEditor
  onImageUpload={async (file) => {
    const form = new FormData()
    form.append("image", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    const { url } = await res.json()
    return url
  }}
/>
```

The returned URL is inserted as `<img src="…" />`.

---

## Exports

```ts
import {
  // Components
  RichTextEditor,
  Toolbar, ToolbarButton, ColorPicker, ImageHandler, TableManager, LinkManager,

  // Utilities
  EditorCommands, HTMLSanitizer, HistoryStack, htmlToMarkdown,

  // Context
  RichTextEditorContext, useRichTextEditor,

  // Types
  type RichTextEditorProps,
  type RichTextEditorHandle,
  type ToolbarItem, type ToolbarPreset, type BuiltInToolbarItem,
  type ToolbarButtonConfig, type ColorPickerProps,
  type SanitizeOptions, type EditorStats, type Theme,
} from "@tolipovjs/rich-text"
```

### `htmlToMarkdown(html)`

```tsx
import { htmlToMarkdown } from "@tolipovjs/rich-text"

const md = htmlToMarkdown("<h1>Hi</h1><p>It's <strong>me</strong></p>")
// → "# Hi\n\nIt's **me**"
```

### `HTMLSanitizer.sanitize(html, opts?)`

```tsx
HTMLSanitizer.sanitize(dirty)                         // safe defaults
HTMLSanitizer.sanitize(dirty, { allowStyle: true })   // permit inline style
```

---

## Migration from v1

| v1 | v2 |
|---|---|
| Required Tailwind in consumer app | **Tailwind removed.** Import `@tolipovjs/rich-text/styles.css` once. |
| Hardcoded colors | All visuals via `--rte-*` CSS variables. |
| `theme` / `apiKey` props (no-op) | `theme` now actually controls light/dark/auto. `apiKey` removed. |
| No ref | Wrap with `forwardRef`. Use `useRef<RichTextEditorHandle>()`. |
| All toolbar buttons always | Pass `toolbar` prop with preset or custom array. |
| Base64 image only | Pass `onImageUpload` for server upload. |
| `style` attribute allowed in sanitizer | Disabled by default. Pass `{ allowStyle: true }` to opt back in. |

---

## Browser Support

Chrome 60+ · Firefox 55+ · Safari 12+ · Edge 79+. The editor uses `document.execCommand` (deprecated but still supported in all modern browsers).

---

## Recipes

Copy-paste ready snippets for common use cases.

### 📝 Blog post editor

```tsx
import { useState } from "react"
import { RichTextEditor, htmlToMarkdown } from "@tolipovjs/rich-text"
import "@tolipovjs/rich-text/styles.css"

export function BlogEditor({ onPublish }: { onPublish: (md: string) => void }) {
  const [html, setHtml] = useState("")
  return (
    <>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        toolbar="all"
        slashMenu
        markdownShortcuts
        bubbleToolbar
        placeholder="Write your post… Type / for blocks"
        minHeight="500px"
      />
      <button onClick={() => onPublish(htmlToMarkdown(html))}>Publish</button>
    </>
  )
}
```

### 💬 Comment box (compact)

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  toolbar="minimal"
  bubbleToolbar
  showStats={false}
  maxLength={500}
  minHeight="80px"
  placeholder="Add a comment…"
/>
```

### 📓 Note-taking app

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  toolbar="basic"
  slashMenu
  markdownShortcuts
  bubbleToolbar
  theme="auto"
  placeholder="Press / for blocks, ** for bold, # for heading"
/>
```

### 📧 Email composer

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  toolbar={["bold", "italic", "underline", "|", "link", "|", "ul", "ol"]}
  allowHtmlMode={false}
  onImageUpload={async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/attach", { method: "POST", body: fd })
    const { url } = await res.json()
    return url
  }}
/>
```

### 🔗 react-hook-form integration

```tsx
import { Controller, useForm } from "react-hook-form"
import { RichTextEditor } from "@tolipovjs/rich-text"

export function PostForm() {
  const { control, handleSubmit } = useForm({ defaultValues: { content: "" } })

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <Controller
        name="content"
        control={control}
        rules={{ required: true, minLength: 20 }}
        render={({ field }) => (
          <RichTextEditor value={field.value} onChange={field.onChange} />
        )}
      />
      <button type="submit">Save</button>
    </form>
  )
}
```

### ⚡ Next.js App Router (SSR safe)

```tsx
// app/editor/page.tsx
"use client"

import dynamic from "next/dynamic"

const Editor = dynamic(
  () => import("@tolipovjs/rich-text").then((m) => m.RichTextEditor),
  { ssr: false },
)

export default function Page() {
  return <Editor placeholder="SSR-safe…" />
}
```

> Or skip `dynamic()` entirely — the editor already guards every `window`/`document` touch.

### ☁️ Cloudinary upload

```tsx
<RichTextEditor
  onImageUpload={async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("upload_preset", "your_preset")
    const res = await fetch("https://api.cloudinary.com/v1_1/<cloud>/image/upload", {
      method: "POST",
      body: fd,
    })
    return (await res.json()).secure_url
  }}
/>
```

---

## Develop

```bash
npm install
npm run dev          # vite playground (examples/playground)
npm run build        # tsup → dist/ (esm + cjs + dts + styles.css)
npm run type-check   # tsc --noEmit
npm test             # vitest run
```

---

## Used by

Building something with `@tolipovjs/rich-text`? [Open a PR](https://github.com/ZiyovuddinTolipov/rich-text/pulls) to add your project here.

- [Live playground](https://rich-text-website.vercel.app/playground) — official demo site
- _Your project here_

---

## Contributing

Repo: https://github.com/ZiyovuddinTolipov/rich-text

1. Fork
2. `git checkout -b feature/x`
3. `git commit -m "feat: x"`
4. `git push origin feature/x`
5. Open a PR

Bug reports, feature requests, and PRs all welcome.

---

## Support

If this library saves you time:

- ⭐ [Star on GitHub](https://github.com/ZiyovuddinTolipov/rich-text)
- 🐛 [Report bugs](https://github.com/ZiyovuddinTolipov/rich-text/issues)
- 💬 [Discuss on GitHub](https://github.com/ZiyovuddinTolipov/rich-text/discussions)

---

## License

MIT © [TolipovJS](https://github.com/ZiyovuddinTolipov)
