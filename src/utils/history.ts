export interface HistoryEntry {
  html: string
  ts: number
}

export class HistoryStack {
  private past: HistoryEntry[] = []
  private future: HistoryEntry[] = []
  private last: string | null = null
  private capacity: number

  constructor(capacity = 100) {
    this.capacity = capacity
  }

  push(html: string): void {
    if (html === this.last) return
    this.past.push({ html, ts: Date.now() })
    if (this.past.length > this.capacity) this.past.shift()
    this.future = []
    this.last = html
  }

  /**
   * Step backward. `current` is the live editor HTML — if the top of the
   * stack matches it, we pop one extra so the user sees a real change.
   */
  undo(current: string): string | null {
    if (this.past.length === 0) return null
    const top = this.past[this.past.length - 1]

    if (top.html === current) {
      if (this.past.length < 2) return null
      this.past.pop()
      this.future.push(top)
      const prev = this.past[this.past.length - 1]
      this.last = prev.html
      return prev.html
    }

    this.future.push({ html: current, ts: Date.now() })
    this.last = top.html
    return top.html
  }

  redo(): string | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(next)
    this.last = next.html
    return next.html
  }

  reset(html: string): void {
    this.past = [{ html, ts: Date.now() }]
    this.future = []
    this.last = html
  }

  canUndo(): boolean {
    return this.past.length > 1
  }

  canRedo(): boolean {
    return this.future.length > 0
  }
}
