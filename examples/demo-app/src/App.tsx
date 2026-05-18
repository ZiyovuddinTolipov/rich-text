import { useEffect, useRef, useState } from "react"
import {
  RichTextEditor,
  htmlToMarkdown,
  DEFAULT_SLASH_COMMANDS,
  type RichTextEditorHandle,
  type Theme,
  type SlashCommand,
} from "@tolipovjs/rich-text"
import { Sparkles } from "lucide-react"

const INITIAL = `<h1>Demo — try the new features</h1>
<p>This editor showcases <strong>v2.2</strong> features.</p>
<ul>
  <li>Type <code>/</code> anywhere — slash command menu opens</li>
  <li>Type <code>**bold**</code> then space — converts to <strong>bold</strong></li>
  <li>Select any text — bubble toolbar appears above</li>
  <li>Press <code>Ctrl/Cmd + F</code> — find &amp; replace popup</li>
  <li>Paste from Word/Google Docs — clutter is stripped</li>
  <li>Click an image — drag corners to resize</li>
</ul>
<p>Try them now ↓</p>
<p><img src="https://picsum.photos/seed/rte/600/300" alt="random" /></p>
`

export function App() {
  const ref = useRef<RichTextEditorHandle>(null)
  const [html, setHtml] = useState(INITIAL)
  const [theme, setTheme] = useState<Theme>("light")
  const [pink, setPink] = useState(false)
  const [slashOn, setSlashOn] = useState(true)
  const [mdOn, setMdOn] = useState(true)
  const [bubbleOn, setBubbleOn] = useState(true)
  const [findOn, setFindOn] = useState(true)
  const [resizeOn, setResizeOn] = useState(true)
  const [cleanPaste, setCleanPaste] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const aiCommand: SlashCommand = {
    id: "ai",
    label: "AI sparkle",
    description: "Insert a sparkly placeholder",
    icon: <Sparkles size={16} />,
    keywords: ["ai", "magic", "sparkle"],
    run: () =>
      ref.current?.insertHTML(
        '<p><em>✨ AI-generated content goes here ✨</em></p>',
      ),
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        ref.current?.markClean()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="app">
      <header className="hero">
        <h1>@tolipovjs/rich-text</h1>
        <p>Free Notion-style editor for React. Test v2.2 features below.</p>
        <span className="tag">v2.2.0 · local build</span>
      </header>

      <div className="tips">
        <div className="tip">
          <strong>Find &amp; replace</strong>
          <span>
            Press <code>Ctrl/Cmd + F</code>. Live highlight, prev/next, replace one or all.
          </span>
        </div>
        <div className="tip">
          <strong>Autosave</strong>
          <span>
            Edit and pause — autosave fires after 1500 ms. Watch the timestamp below.
          </span>
        </div>
        <div className="tip">
          <strong>Paste cleanup</strong>
          <span>Paste from Word/Google Docs — MSO classes and clutter are stripped.</span>
        </div>
        <div className="tip">
          <strong>Image resize</strong>
          <span>Click any image — drag the corner handles to resize.</span>
        </div>
        <div className="tip">
          <strong>Dirty tracking</strong>
          <span>
            Edit then <code>Ctrl + S</code> to mark clean. Dirty: <code>{String(dirty)}</code>.
          </span>
        </div>
      </div>

      <div className="controls">
        <label>
          Theme:
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="auto">auto</option>
          </select>
        </label>

        <label className={`pill${pink ? " on" : ""}`}>
          <input type="checkbox" checked={pink} onChange={() => setPink((v) => !v)} />
          Pink theme
        </label>

        <label className={`pill${slashOn ? " on" : ""}`}>
          <input type="checkbox" checked={slashOn} onChange={() => setSlashOn((v) => !v)} />
          Slash menu
        </label>

        <label className={`pill${mdOn ? " on" : ""}`}>
          <input type="checkbox" checked={mdOn} onChange={() => setMdOn((v) => !v)} />
          Markdown shortcuts
        </label>

        <label className={`pill${bubbleOn ? " on" : ""}`}>
          <input type="checkbox" checked={bubbleOn} onChange={() => setBubbleOn((v) => !v)} />
          Bubble toolbar
        </label>

        <label className={`pill${findOn ? " on" : ""}`}>
          <input type="checkbox" checked={findOn} onChange={() => setFindOn((v) => !v)} />
          Find &amp; replace
        </label>

        <label className={`pill${resizeOn ? " on" : ""}`}>
          <input type="checkbox" checked={resizeOn} onChange={() => setResizeOn((v) => !v)} />
          Image resize
        </label>

        <label className={`pill${cleanPaste ? " on" : ""}`}>
          <input type="checkbox" checked={cleanPaste} onChange={() => setCleanPaste((v) => !v)} />
          Clean paste
        </label>

        <button onClick={() => ref.current?.openFindReplace()}>Open find</button>
        <button onClick={() => ref.current?.markClean()}>Mark clean</button>
        <button onClick={() => ref.current?.clear()}>Clear</button>
      </div>

      <div className="status">
        <span>
          Dirty: <strong>{String(dirty)}</strong>
        </span>
        <span>
          Last autosave: <strong>{savedAt ?? "—"}</strong>
        </span>
      </div>

      <div className={`editor-wrap${pink ? " theme-pink" : ""}`}>
        <RichTextEditor
          ref={ref}
          value={html}
          onChange={setHtml}
          theme={theme}
          toolbar="all"
          showStats
          slashMenu={slashOn ? [aiCommand, ...DEFAULT_SLASH_COMMANDS] : false}
          markdownShortcuts={mdOn}
          bubbleToolbar={bubbleOn}
          findReplace={findOn}
          imageResize={resizeOn}
          cleanPaste={cleanPaste}
          onDirtyChange={setDirty}
          autosave={{
            interval: 1500,
            onSave: (html) => {
              console.log("[autosave] saved", html.length, "chars")
              setSavedAt(new Date().toLocaleTimeString())
            },
          }}
          placeholder="Type / for commands, or **bold**, # heading…"
        />
      </div>

      <div className="output">
        <div>
          <strong>HTML output</strong>
          <pre>{html}</pre>
        </div>
        <div>
          <strong>Markdown export</strong>
          <pre>{htmlToMarkdown(html)}</pre>
        </div>
      </div>
    </div>
  )
}
