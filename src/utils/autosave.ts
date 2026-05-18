/**
 * Debounced autosave scheduler.
 *
 * Calls `onSave(content)` after the content has been quiet for `interval` ms.
 * The scheduler is content-aware: identical successive content is skipped.
 */

export interface AutosaveScheduler {
  /** Notify the scheduler that content changed. Resets the debounce window. */
  notify(content: string): void
  /** Flush any pending save immediately (e.g., on blur or unmount). */
  flush(): void
  /** Cancel a pending save without firing. */
  cancel(): void
}

export interface AutosaveOptions {
  /** Debounce window in ms. Default 1500. */
  interval?: number
  /** Save callback. Errors are caught and reported via `onError`. */
  onSave: (content: string) => void | Promise<void>
  /** Optional error handler. Defaults to `console.error`. */
  onError?: (err: unknown) => void
}

export function createAutosaveScheduler(opts: AutosaveOptions): AutosaveScheduler {
  const interval = opts.interval ?? 1500
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingContent: string | null = null
  let lastSavedContent: string | null = null
  let isSaving = false

  function fire() {
    if (pendingContent === null) return
    if (pendingContent === lastSavedContent) {
      pendingContent = null
      return
    }
    const content = pendingContent
    pendingContent = null
    isSaving = true
    try {
      const result = opts.onSave(content)
      Promise.resolve(result)
        .then(() => {
          lastSavedContent = content
        })
        .catch((err) => {
          ;(opts.onError ?? console.error)(err)
        })
        .finally(() => {
          isSaving = false
        })
    } catch (err) {
      ;(opts.onError ?? console.error)(err)
      isSaving = false
    }
  }

  return {
    notify(content: string) {
      pendingContent = content
      if (timer) clearTimeout(timer)
      timer = setTimeout(fire, interval)
    },
    flush() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (!isSaving) fire()
    },
    cancel() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      pendingContent = null
    },
  }
}
