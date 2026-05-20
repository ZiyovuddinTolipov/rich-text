"use client"

import type React from "react"
import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react"
import { Toolbar } from "./Toolbar"
import { SlashMenu } from "./SlashMenu"
import { BubbleToolbar } from "./BubbleToolbar"
import { FindReplace } from "./FindReplace"
import { ImageResizer } from "./ImageResizer"
import { HTMLSanitizer } from "../utils/sanitizer"
import { EditorCommands } from "../utils/commands"
import { HistoryStack } from "../utils/history"
import { applyMarkdownShortcut } from "../utils/mdShortcuts"
import { DEFAULT_SLASH_COMMANDS } from "../utils/slashCommands"
import { cleanPastedHtml, isExternalPaste } from "../utils/pasteCleanup"
import { hashString } from "../utils/dirty"
import { createAutosaveScheduler, type AutosaveScheduler } from "../utils/autosave"
import { RichTextEditorContext } from "../context"
import type {
  RichTextEditorHandle,
  RichTextEditorProps,
  SlashCommand,
} from "../types"

interface SlashState {
  open: boolean
  query: string
  pos: { top: number; left: number }
  triggerNode: Text
  triggerOffset: number
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  {
    value = "",
    onChange,
    placeholder = "Start typing...",
    className = "",
    style,
    disabled = false,
    readOnly = false,
    theme = "light",
    toolbar = "all",
    customButtons,
    onImageUpload,
    autoFocus = false,
    maxLength,
    textColorPresets,
    backgroundColorPresets,
    minHeight,
    showStats = false,
    allowHtmlMode = true,
    onFocus,
    onBlur,
    onSelectionChange,
    slashMenu = false,
    markdownShortcuts = false,
    bubbleToolbar = false,
    findReplace = false,
    autosave,
    cleanPaste = true,
    imageResize = false,
    onAutosave,
    onDirtyChange,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef(value)
  const initialValueRef = useRef(value)
  const isTypingRef = useRef(false)
  const historyRef = useRef(new HistoryStack(100))
  const dirtyBaselineRef = useRef(hashString(value))
  const wasDirtyRef = useRef(false)
  const autosaveRef = useRef<AutosaveScheduler | null>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlSource, setHtmlSource] = useState(value)
  const [isEmpty, setIsEmpty] = useState(!value)
  const [slashState, setSlashState] = useState<SlashState | null>(null)
  const [findOpen, setFindOpen] = useState(false)

  const slashCommands = useMemo<SlashCommand[]>(() => {
    if (slashMenu === false) return []
    if (slashMenu === true) return DEFAULT_SLASH_COMMANDS
    return slashMenu
  }, [slashMenu])

  // ---------- Imperative API ----------
  const getHTML = useCallback((): string => {
    if (isHtmlMode) return htmlSource
    return editorRef.current?.innerHTML ?? ""
  }, [isHtmlMode, htmlSource])

  const setHTML = useCallback((html: string) => {
    const sanitized = HTMLSanitizer.sanitize(html)
    if (editorRef.current) editorRef.current.innerHTML = sanitized
    setHtmlSource(sanitized)
    lastValueRef.current = sanitized
    historyRef.current.push(sanitized)
    setIsEmpty(!HTMLSanitizer.extractText(sanitized).trim())
    onChange?.(sanitized)
  }, [onChange])

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
      clear: () => setHTML(""),
      getHTML,
      setHTML,
      getText: () => HTMLSanitizer.extractText(getHTML()),
      insertHTML: (html: string) => {
        EditorCommands.insertHTML(html)
        handleInput()
      },
      execCommand: (cmd: string, val?: string) => {
        EditorCommands.execCommand(cmd, val)
        handleInput()
      },
      getStats: () => EditorCommands.stats(getHTML()),
      isDirty: () => hashString(getHTML()) !== dirtyBaselineRef.current,
      markClean: () => {
        dirtyBaselineRef.current = hashString(getHTML())
        if (wasDirtyRef.current) {
          wasDirtyRef.current = false
          onDirtyChange?.(false)
        }
      },
      openFindReplace: () => setFindOpen(true),
      closeFindReplace: () => setFindOpen(false),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getHTML, setHTML, onDirtyChange],
  )

  // ---------- Sync external value ----------
  useEffect(() => {
    if (isTypingRef.current) return
    if (value === lastValueRef.current) return
    if (editorRef.current && !isHtmlMode) {
      editorRef.current.innerHTML = value
    }
    setHtmlSource(value)
    lastValueRef.current = value
    historyRef.current.reset(value)
    dirtyBaselineRef.current = hashString(value)
    if (wasDirtyRef.current) {
      wasDirtyRef.current = false
      onDirtyChange?.(false)
    }
    setIsEmpty(!HTMLSanitizer.extractText(value).trim())
  }, [value, isHtmlMode, onDirtyChange])

  // ---------- Mount: set initial HTML once ----------
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      editorRef.current.innerHTML = initialValueRef.current
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Auto focus ----------
  useEffect(() => {
    if (autoFocus && editorRef.current && !readOnly && !disabled) {
      editorRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Stats ----------
  const stats = useMemo(() => {
    if (!showStats) return null
    return EditorCommands.stats(htmlSource || value)
  }, [showStats, htmlSource, value])

  // ---------- Slash menu detection ----------
  const updateSlashState = useCallback(() => {
    if (slashCommands.length === 0) return
    if (typeof window === "undefined") return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) {
      setSlashState(null)
      return
    }
    const range = sel.getRangeAt(0)
    const node = range.startContainer
    if (node.nodeType !== Node.TEXT_NODE) {
      setSlashState(null)
      return
    }
    if (!editorRef.current?.contains(node)) {
      setSlashState(null)
      return
    }
    const textNode = node as Text
    const offset = range.startOffset
    const before = textNode.data.slice(0, offset)
    const m = before.match(/(?:^|\s)\/([\w-]*)$/)
    if (!m) {
      setSlashState(null)
      return
    }
    const triggerOffset = offset - m[1].length - 1
    const rectRange = document.createRange()
    rectRange.setStart(textNode, triggerOffset)
    rectRange.setEnd(textNode, offset)
    const rect = rectRange.getBoundingClientRect()
    setSlashState({
      open: true,
      query: m[1],
      pos: {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
      triggerNode: textNode,
      triggerOffset,
    })
  }, [slashCommands.length])

  const handleSlashSelect = useCallback(
    (cmd: SlashCommand) => {
      if (!slashState || !editorRef.current) return
      const sel = window.getSelection()
      if (!sel) return
      const range = document.createRange()
      range.setStart(slashState.triggerNode, slashState.triggerOffset)
      if (sel.rangeCount > 0) {
        const cur = sel.getRangeAt(0)
        range.setEnd(cur.endContainer, cur.endOffset)
      } else {
        range.setEnd(slashState.triggerNode, slashState.triggerOffset)
      }
      range.deleteContents()
      sel.removeAllRanges()
      sel.addRange(range)
      try {
        cmd.run(editorRef.current)
      } catch (err) {
        console.warn("Slash command failed:", err)
      }
      setSlashState(null)
      handleInput()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slashState],
  )

  // ---------- Input handling ----------
  const handleInput = useCallback(() => {
    if (!editorRef.current || isHtmlMode) return
    isTypingRef.current = true
    const raw = editorRef.current.innerHTML
    if (maxLength != null) {
      const text = HTMLSanitizer.extractText(raw)
      if (text.length > maxLength) {
        editorRef.current.innerHTML = lastValueRef.current
        return
      }
    }
    const sanitized = HTMLSanitizer.sanitize(raw)
    lastValueRef.current = sanitized
    setHtmlSource(sanitized)
    setIsEmpty(!HTMLSanitizer.extractText(sanitized).trim())
    historyRef.current.push(sanitized)
    onChange?.(sanitized)
    updateSlashState()
    // Dirty tracking
    const nowDirty = hashString(sanitized) !== dirtyBaselineRef.current
    if (nowDirty !== wasDirtyRef.current) {
      wasDirtyRef.current = nowDirty
      onDirtyChange?.(nowDirty)
    }
    // Autosave debounce
    autosaveRef.current?.notify(sanitized)
    setTimeout(() => {
      isTypingRef.current = false
    }, 50)
  }, [isHtmlMode, maxLength, onChange, updateSlashState, onDirtyChange])

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setHtmlSource(content)
    lastValueRef.current = content
    onChange?.(content)
  }

  // ---------- Paste ----------
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const clipboardData = e.clipboardData
    const items = clipboardData.items

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile()
        if (file) {
          let src: string
          try {
            if (onImageUpload) {
              src = await onImageUpload(file)
            } else {
              src = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (ev) => resolve(ev.target?.result as string)
                reader.onerror = () => reject(reader.error)
                reader.readAsDataURL(file)
              })
            }
            editorRef.current?.focus()
            EditorCommands.insertImage(src, file.name)
            handleInput()
          } catch (err) {
            console.error("Image paste failed:", err)
          }
          return
        }
      }
    }

    // HTML paste path (Word, GDocs, Pages, web pages, internal copy)
    const htmlData = clipboardData.getData("text/html")
    if (htmlData) {
      const cleaned =
        cleanPaste && isExternalPaste(htmlData) ? cleanPastedHtml(htmlData) : htmlData
      EditorCommands.insertHTML(cleaned)
      handleInput()
      return
    }

    const text = clipboardData.getData("text/plain")
    EditorCommands.execCommand("insertText", text)
  }, [onImageUpload, handleInput, cleanPaste])

  // ---------- HTML mode toggle ----------
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      const sanitized = HTMLSanitizer.sanitize(htmlSource)
      if (editorRef.current) editorRef.current.innerHTML = sanitized
      lastValueRef.current = sanitized
      onChange?.(sanitized)
    } else if (editorRef.current) {
      setHtmlSource(editorRef.current.innerHTML)
    }
    setIsHtmlMode((m) => !m)
  }

  // ---------- Keyboard shortcuts (undo/redo + md shortcuts + find) ----------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey

    if (markdownShortcuts && !mod && editorRef.current) {
      const handled = applyMarkdownShortcut(e.nativeEvent, editorRef.current)
      if (handled) {
        handleInput()
        return
      }
    }

    if (findReplace && mod && (e.key === "f" || e.key === "F")) {
      e.preventDefault()
      setFindOpen(true)
      return
    }

    if (mod && e.key === "z" && !e.shiftKey) {
      const current = editorRef.current?.innerHTML ?? ""
      const prev = historyRef.current.undo(current)
      if (prev != null && editorRef.current) {
        e.preventDefault()
        editorRef.current.innerHTML = prev
        lastValueRef.current = prev
        setHtmlSource(prev)
        onChange?.(prev)
      }
    } else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      const next = historyRef.current.redo()
      if (next != null && editorRef.current) {
        e.preventDefault()
        editorRef.current.innerHTML = next
        lastValueRef.current = next
        setHtmlSource(next)
        onChange?.(next)
      }
    }
  }

  // ---------- Checklist toggle on click ----------
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const handler = (e: Event) => {
      const target = e.target as HTMLElement
      const li = target.closest("li")
      if (li && li.parentElement?.getAttribute("data-type") === "task") {
        const rect = li.getBoundingClientRect()
        const me = e as MouseEvent
        if (me.clientX - rect.left < 24) {
          const checked = li.getAttribute("data-checked") === "true"
          li.setAttribute("data-checked", checked ? "false" : "true")
          handleInput()
        }
      }
    }
    el.addEventListener("click", handler)
    return () => el.removeEventListener("click", handler)
  }, [handleInput])

  const closeSlash = useCallback(() => setSlashState(null), [])

  // ---------- Autosave scheduler lifecycle ----------
  useEffect(() => {
    if (!autosave) {
      autosaveRef.current?.cancel()
      autosaveRef.current = null
      return
    }
    autosaveRef.current = createAutosaveScheduler({
      interval: autosave.interval,
      onError: autosave.onError,
      onSave: async (html) => {
        await autosave.onSave(html)
        onAutosave?.(html)
      },
    })
    return () => {
      autosaveRef.current?.flush()
      autosaveRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave?.interval, autosave?.onSave, autosave?.onError, onAutosave])

  const rootClass = ["rte-root", className].filter(Boolean).join(" ")
  const surfaceStyle: React.CSSProperties = minHeight ? { ["--rte-min-height" as any]: minHeight } : {}

  return (
    <RichTextEditorContext.Provider value={{ onImageUpload, readOnly, disabled }}>
      <div
        className={rootClass}
        data-rte-theme={theme}
        style={style}
      >
        <Toolbar
          items={toolbar}
          customButtons={customButtons}
          textColorPresets={textColorPresets}
          backgroundColorPresets={backgroundColorPresets}
          onSelectionChange={onSelectionChange}
        />

        {allowHtmlMode && (
          <div className="rte-statusbar">
            <span>{isHtmlMode ? "HTML Source" : "Visual Editor"}</span>
            <button type="button" className="rte-mode-toggle" onClick={toggleHtmlMode}>
              {isHtmlMode ? "Visual" : "HTML"}
            </button>
          </div>
        )}

        {findReplace && (
          <FindReplace
            editor={editorRef.current}
            open={findOpen}
            onClose={() => setFindOpen(false)}
            onChange={handleInput}
          />
        )}

        {isHtmlMode ? (
          <textarea
            value={htmlSource}
            onChange={handleHtmlChange}
            className="rte-html-source"
            disabled={disabled}
            spellCheck={false}
          />
        ) : (
          <div className="rte-surface-wrap" style={{ position: "relative" }}>
            <div
              ref={editorRef}
              contentEditable={!disabled && !readOnly}
              onInput={handleInput}
              onPaste={handlePaste}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              className="rte-surface"
              style={surfaceStyle}
              data-placeholder={placeholder}
              data-empty={isEmpty || undefined}
              data-readonly={readOnly || undefined}
              data-disabled={disabled || undefined}
              suppressContentEditableWarning
            />
            {imageResize && <ImageResizer editor={editorRef.current} onResize={handleInput} />}
          </div>
        )}

        {showStats && stats && (
          <div className="rte-stats" aria-live="polite">
            <span>{stats.words} words</span>
            <span>{stats.characters} chars</span>
            {maxLength != null && <span>/ {maxLength} max</span>}
          </div>
        )}

        {slashCommands.length > 0 && slashState && (
          <SlashMenu
            open={slashState.open}
            query={slashState.query}
            position={slashState.pos}
            commands={slashCommands}
            onSelect={handleSlashSelect}
            onClose={closeSlash}
          />
        )}

        {bubbleToolbar !== false && !isHtmlMode && (
          <BubbleToolbar
            editor={editorRef.current}
            items={bubbleToolbar === true ? true : bubbleToolbar}
            onAction={handleInput}
          />
        )}
      </div>
    </RichTextEditorContext.Provider>
  )
})
