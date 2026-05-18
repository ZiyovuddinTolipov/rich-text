import { useRef, useState } from "react"
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
<p>This editor showcases <strong>v2.1</strong> features.</p>
<ul>
  <li>Type <code>/</code> anywhere — slash command menu opens</li>
  <li>Type <code>**bold**</code> then space — converts to <strong>bold</strong></li>
  <li>Select any text — bubble toolbar appears above</li>
</ul>
<p>Try them now ↓</p>
`

export function App() {
  const ref = useRef<RichTextEditorHandle>(null)
  const [html, setHtml] = useState(INITIAL)
  const [theme, setTheme] = useState<Theme>("light")
  const [pink, setPink] = useState(false)
  const [slashOn, setSlashOn] = useState(true)
  const [mdOn, setMdOn] = useState(true)
  const [bubbleOn, setBubbleOn] = useState(true)

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

  return (
    <div className="app">
      <header className="hero">
        <h1>@tolipovjs/rich-text</h1>
        <p>Free Notion-style editor for React. Test v2.1 features below.</p>
        <span className="tag">v2.1.0 · local build</span>
      </header>

      <div className="tips">
        <div className="tip">
          <strong>Slash menu</strong>
          <span>
            Type <code>/</code> then start filtering — try <code>/head</code>, <code>/table</code>, <code>/todo</code>.
          </span>
        </div>
        <div className="tip">
          <strong>Markdown shortcuts</strong>
          <span>
            <code>**bold**</code>, <code>*italic*</code>, <code># H1</code>, <code>- list</code>, <code>&gt; quote</code>, <code>---</code>, <code>```</code>
          </span>
        </div>
        <div className="tip">
          <strong>Bubble toolbar</strong>
          <span>Select text → floating toolbar appears above selection.</span>
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

        <button onClick={() => ref.current?.clear()}>Clear</button>
        <button onClick={() => alert(ref.current?.getText())}>getText()</button>
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
