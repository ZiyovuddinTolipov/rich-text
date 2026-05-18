/**
 * Fast 32-bit FNV-1a hash for cheap content comparison.
 * Not cryptographically secure — only used for dirty-state checks.
 */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function isDirtyAgainst(initialHash: number, current: string): boolean {
  return hashString(current) !== initialHash
}
