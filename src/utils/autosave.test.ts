import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createAutosaveScheduler } from "./autosave"

describe("autosave scheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calls onSave after debounce interval", () => {
    const onSave = vi.fn()
    const s = createAutosaveScheduler({ interval: 1000, onSave })
    s.notify("hello")
    expect(onSave).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave).toHaveBeenCalledWith("hello")
  })

  it("debounces consecutive notifies", () => {
    const onSave = vi.fn()
    const s = createAutosaveScheduler({ interval: 1000, onSave })
    s.notify("a")
    vi.advanceTimersByTime(500)
    s.notify("ab")
    vi.advanceTimersByTime(500)
    s.notify("abc")
    vi.advanceTimersByTime(999)
    expect(onSave).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave).toHaveBeenCalledWith("abc")
  })

  it("skips duplicate save when content unchanged after last save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const s = createAutosaveScheduler({ interval: 500, onSave })
    s.notify("v1")
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(onSave).toHaveBeenCalledTimes(1)

    s.notify("v1")
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("flush() fires pending save immediately", () => {
    const onSave = vi.fn()
    const s = createAutosaveScheduler({ interval: 1000, onSave })
    s.notify("hi")
    s.flush()
    expect(onSave).toHaveBeenCalledWith("hi")
  })

  it("cancel() drops pending save without firing", () => {
    const onSave = vi.fn()
    const s = createAutosaveScheduler({ interval: 1000, onSave })
    s.notify("hi")
    s.cancel()
    vi.advanceTimersByTime(5000)
    expect(onSave).not.toHaveBeenCalled()
  })

  it("reports onSave errors via onError", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("boom"))
    const onError = vi.fn()
    const s = createAutosaveScheduler({ interval: 100, onSave, onError })
    s.notify("x")
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})
