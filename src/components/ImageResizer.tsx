"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ImageResizerProps {
  editor: HTMLDivElement | null
  /** Min width in pixels. Default 40. */
  minWidth?: number
  /** Max width in pixels. Default editor surface width. */
  maxWidth?: number
  /** Notify host that an image was resized so it can fire onChange. */
  onResize?: () => void
}

type Handle = "nw" | "ne" | "sw" | "se"

interface DragState {
  img: HTMLImageElement
  handle: Handle
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  aspect: number
}

export function ImageResizer({
  editor,
  minWidth = 40,
  maxWidth,
  onResize,
}: ImageResizerProps) {
  const [target, setTarget] = useState<HTMLImageElement | null>(null)
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null,
  )
  const dragRef = useRef<DragState | null>(null)

  // Click on an image inside the editor -> select it
  useEffect(() => {
    if (!editor) return
    function onClick(e: MouseEvent) {
      const tgt = e.target as HTMLElement
      if (tgt.tagName === "IMG" && editor!.contains(tgt)) {
        setTarget(tgt as HTMLImageElement)
      } else if (!(tgt as HTMLElement).closest(".rte-resize-handle")) {
        setTarget(null)
      }
    }
    editor.addEventListener("click", onClick)
    return () => editor.removeEventListener("click", onClick)
  }, [editor])

  // Track target rectangle (also on window resize/scroll)
  useEffect(() => {
    if (!target || !editor) {
      setBox(null)
      return
    }
    function recompute() {
      if (!target || !editor) return
      const r = target.getBoundingClientRect()
      const er = editor.getBoundingClientRect()
      setBox({
        top: r.top - er.top + editor.scrollTop,
        left: r.left - er.left + editor.scrollLeft,
        width: r.width,
        height: r.height,
      })
    }
    recompute()
    window.addEventListener("scroll", recompute, true)
    window.addEventListener("resize", recompute)
    return () => {
      window.removeEventListener("scroll", recompute, true)
      window.removeEventListener("resize", recompute)
    }
  }, [target, editor])

  // Drag handlers
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      const signX = drag.handle === "ne" || drag.handle === "se" ? 1 : -1
      const signY = drag.handle === "sw" || drag.handle === "se" ? 1 : -1
      let nextWidth = drag.startWidth + dx * signX
      let nextHeight = drag.startHeight + dy * signY
      // preserve aspect — pick the bigger delta to feel natural
      if (Math.abs(dx) > Math.abs(dy)) {
        nextHeight = nextWidth / drag.aspect
      } else {
        nextWidth = nextHeight * drag.aspect
      }
      const cap = maxWidth ?? (editor?.clientWidth ?? Infinity)
      nextWidth = Math.max(minWidth, Math.min(nextWidth, cap))
      nextHeight = nextWidth / drag.aspect
      drag.img.style.width = `${Math.round(nextWidth)}px`
      drag.img.style.height = `${Math.round(nextHeight)}px`
    }
    function onUp() {
      if (!dragRef.current) return
      const img = dragRef.current.img
      // Promote inline style to attributes (sanitizer-safe)
      const w = parseInt(img.style.width || "", 10)
      const h = parseInt(img.style.height || "", 10)
      if (w) img.setAttribute("width", String(w))
      if (h) img.setAttribute("height", String(h))
      dragRef.current = null
      onResize?.()
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [editor, minWidth, maxWidth, onResize])

  function startDrag(e: React.MouseEvent<HTMLDivElement>, handle: Handle) {
    if (!target) return
    e.preventDefault()
    e.stopPropagation()
    const r = target.getBoundingClientRect()
    dragRef.current = {
      img: target,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: r.width,
      startHeight: r.height,
      aspect: r.width / r.height || 1,
    }
  }

  if (!target || !box) return null

  return (
    <div
      className="rte-resize"
      style={{
        position: "absolute",
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {(["nw", "ne", "sw", "se"] as Handle[]).map((h) => (
        <div
          key={h}
          className={`rte-resize-handle rte-resize-handle--${h}`}
          onMouseDown={(e) => startDrag(e, h)}
        />
      ))}
    </div>
  )
}
