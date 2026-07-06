const blockedElements = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "applet",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "svg",
  "math",
  "template",
];

const blockedElementPattern = new RegExp(
  `<\\s*(${blockedElements.join("|")})(?:\\s[^>]*)?>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`,
  "gi",
);

const blockedStandalonePattern = new RegExp(
  `<\\s*\\/?\\s*(?:${blockedElements.join("|")})(?:\\s[^>]*)?>`,
  "gi",
);

const eventHandlerAttributePattern = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const dangerousUrlAttributePattern = /\s+(href|src|xlink:href|formaction|poster)\s*=\s*("|')?\s*(?:javascript:|data:|vbscript:)[^"'\s>]*/gi;
const styleAttributePattern = /\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const srcsetAttributePattern = /\s+srcset\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/**
 * Sanitizes CMS-authored HTML before it is returned to public clients.
 *
 * This is a conservative, dependency-free guard for stored content. It removes
 * scriptable elements, inline event handlers, inline styles, srcset, and
 * javascript/data/vbscript URLs while preserving normal rich-text tags.
 *
 * Keep admin edit endpoints raw so editors can continue editing saved HTML.
 */
export function sanitizeHtmlContent(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  let html = String(value);
  let previous: string;

  do {
    previous = html;
    html = html.replace(blockedElementPattern, "");
  } while (html !== previous);

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(blockedStandalonePattern, "")
    .replace(eventHandlerAttributePattern, "")
    .replace(dangerousUrlAttributePattern, "")
    .replace(styleAttributePattern, "")
    .replace(srcsetAttributePattern, "");
}
