const DANGEROUS_PATTERNS = [
  /mso-[a-z-]+/i,
  /expression\s*\(/i,
  /javascript\s*:/i,
  /behavior\s*:/i,
  /binding\s*:/i,
  /@import/i,
]

const SAFE_PROPS = new Set([
  "color",
  "background-color",
  "background",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "line-height",
  "letter-spacing",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-color",
  "border-width",
  "border-style",
  "border-radius",
  "width",
  "height",
  "display",
  "vertical-align",
])

export function sanitizeStyle(value: string): string {
  return value
    .split(";")
    .map((decl) => decl.trim())
    .filter((decl) => {
      if (!decl) return false
      if (DANGEROUS_PATTERNS.some((re) => re.test(decl))) return false
      const colon = decl.indexOf(":")
      if (colon === -1) return false
      const prop = decl.slice(0, colon).trim().toLowerCase()
      // allow position only if not fixed/absolute
      if (prop === "position") {
        const val = decl.slice(colon + 1).trim().toLowerCase()
        return val !== "fixed" && val !== "absolute"
      }
      return SAFE_PROPS.has(prop)
    })
    .join("; ")
}
