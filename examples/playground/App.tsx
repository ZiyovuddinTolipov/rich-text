import { useRef, useState } from "react"
import {
  RichTextEditor,
  htmlToMarkdown,
  type RichTextEditorHandle,
  type Theme,
  type ToolbarPreset,
} from "@tolipovjs/rich-text"

const INITIAL_HTML = `
<h1>Welcome to @tolipovjs/rich-text v2</h1>
<p>This is a <strong>fully featured</strong> rich text editor with <em>CSS variable</em> theming.</p>
<ul>
  <li>Type to see live updates</li>
  <li>Toggle dark mode</li>
  <li>Try the pink theme — proves CSS vars work</li>
</ul>
<p>Try a <a href="https://github.com/ZiyovuddinTolipov/rich-text">link</a> too.</p>
`

export function App() {
  const editorRef = useRef<RichTextEditorHandle>(null)
  const [html, setHtml] = useState(INITIAL_HTML)
  const [theme, setTheme] = useState<Theme>("light")
  const [preset, setPreset] = useState<ToolbarPreset>("all")
  const [pinkTheme, setPinkTheme] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [slashMenu, setSlashMenu] = useState(true)
  const [mdShortcuts, setMdShortcuts] = useState(true)
  const [bubble, setBubble] = useState(true)

  const handleUpload = async (file: File): Promise<string> => {
    // Mock server upload — log file and return a fake URL after 500ms
    console.log("Uploading:", file.name, file.size, "bytes")
    await new Promise((r) => setTimeout(r, 500))
    return URL.createObjectURL(file)
  }

  return (
    <div className="app">
      <h1>@tolipovjs/rich-text v2 — Playground</h1>
      <p>Edit content below. All theme/toolbar controls live-update.</p>

      <div className="controls">
        <label>
          Theme:&nbsp;
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="auto">auto</option>
          </select>
        </label>

        <label>
          Toolbar:&nbsp;
          <select value={preset} onChange={(e) => setPreset(e.target.value as ToolbarPreset)}>
            <option value="all">all</option>
            <option value="basic">basic</option>
            <option value="minimal">minimal</option>
          </select>
        </label>

        <button onClick={() => setPinkTheme((v) => !v)}>
          {pinkTheme ? "Reset accent" : "Pink accent (CSS vars)"}
        </button>

        <button onClick={() => setShowStats((v) => !v)}>
          {showStats ? "Hide stats" : "Show stats"}
        </button>

        <button onClick={() => setSlashMenu((v) => !v)}>
          Slash: {slashMenu ? "on" : "off"}
        </button>

        <button onClick={() => setMdShortcuts((v) => !v)}>
          MD shortcuts: {mdShortcuts ? "on" : "off"}
        </button>

        <button onClick={() => setBubble((v) => !v)}>
          Bubble: {bubble ? "on" : "off"}
        </button>

        <button onClick={() => editorRef.current?.focus()}>focus()</button>
        <button onClick={() => editorRef.current?.clear()}>clear()</button>
        <button onClick={() => alert(editorRef.current?.getText())}>getText()</button>
        <button onClick={() => editorRef.current?.insertHTML("<p><em>Inserted!</em></p>")}>
          insertHTML()
        </button>
      </div>

      <div className={pinkTheme ? "pink-theme" : undefined}>
        <RichTextEditor
          ref={editorRef}
          value={html}
          onChange={setHtml}
          theme={theme}
          toolbar={preset}
          showStats={showStats}
          maxLength={5000}
          onImageUpload={handleUpload}
          slashMenu={slashMenu}
          markdownShortcuts={mdShortcuts}
          bubbleToolbar={bubble}
          placeholder="Type / for commands, or **bold**, # heading…"
        />
      </div>

      <div className="output">
        <strong>HTML output:</strong>
        <pre>{html}</pre>
        <strong>Markdown output:</strong>
        <pre>{htmlToMarkdown(html)}</pre>
      </div>
    </div>
  )
}
