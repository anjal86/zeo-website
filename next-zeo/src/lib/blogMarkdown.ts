export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function formatInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_match, text, href) => {
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

function isMarkdownTable(lines: string[]) {
  return lines.length >= 2 &&
    lines[0].includes("|") &&
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[1]);
}

function markdownTableToHtml(lines: string[]) {
  const parseCells = (line: string) => line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  const headers = parseCells(lines[0]);
  const rows = lines.slice(2).map(parseCells).filter((cells) => cells.some(Boolean));

  return `<table><thead><tr>${headers.map((cell) => `<th>${formatInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_header, index) => `<td>${formatInlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function isLikelyPlainHeading(line: string, index: number) {
  const text = line.trim();
  if (!text) return false;
  if (/^[-•>]/.test(text)) return false;
  if (/^\d+[.)]\s+/.test(text)) return true;
  if (text.length < 8 || text.length > 140) return false;
  if (/[.!?]$/.test(text)) return false;
  if (/[:,]$/.test(text) && index !== 0) return false;

  const words = text.split(/\s+/);
  if (words.length > 14) return index === 0;

  const headingSignals = [
    "significance", "route", "routes", "itinerary", "cost", "price", "permit", "permits",
    "best time", "preparation", "journey", "travel", "guide", "faq", "conclusion",
    "highlights", "overview", "things to know", "how to", "why", "where", "when"
  ];
  const lower = text.toLowerCase();
  if (headingSignals.some((signal) => lower.includes(signal))) return true;

  const titleCaseWords = words.filter((word) => /^[A-Z0-9]/.test(word.replace(/^[“"'‘(]/, "")));
  return titleCaseWords.length >= Math.ceil(words.length * 0.55);
}

function collectWhile(lines: string[], start: number, predicate: (line: string) => boolean) {
  const collected: string[] = [];
  let index = start;
  while (index < lines.length && predicate(lines[index].trim())) {
    collected.push(lines[index].trim());
    index += 1;
  }
  return { collected, next: index };
}

export function plainTextToHtml(value: string) {
  const lines = decodeHtmlEntities(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const remainingUntilBlank: string[] = [];
    for (let cursor = index; cursor < lines.length && lines[cursor].trim(); cursor += 1) {
      remainingUntilBlank.push(lines[cursor].trim());
    }
    if (isMarkdownTable(remainingUntilBlank)) {
      html.push(markdownTableToHtml(remainingUntilBlank));
      index += remainingUntilBlank.length;
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${formatInlineMarkdown(line.slice(4).trim())}</h3>`);
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(`<h2>${formatInlineMarkdown(line.slice(3).trim())}</h2>`);
      index += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      html.push(`<h2>${formatInlineMarkdown(line.slice(2).trim())}</h2>`);
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const { collected, next } = collectWhile(lines, index, (item) => item.startsWith("> "));
      html.push(`<blockquote>${collected.map((item) => formatInlineMarkdown(item.replace(/^>\s*/, ""))).join("<br />")}</blockquote>`);
      index = next;
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      const { collected, next } = collectWhile(lines, index, (item) => /^[-•]\s+/.test(item));
      html.push(`<ul>${collected.map((item) => `<li>${formatInlineMarkdown(item.replace(/^[-•]\s+/, ""))}</li>`).join("")}</ul>`);
      index = next;
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const { collected, next } = collectWhile(lines, index, (item) => /^\d+[.)]\s+/.test(item));
      if (collected.length > 1) {
        html.push(`<ol>${collected.map((item) => `<li>${formatInlineMarkdown(item.replace(/^\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
      } else {
        html.push(`<h3>${formatInlineMarkdown(line.replace(/^\d+[.)]\s+/, ""))}</h3>`);
      }
      index = next;
      continue;
    }

    if (isLikelyPlainHeading(line, html.length)) {
      html.push(`<h2>${formatInlineMarkdown(line)}</h2>`);
      index += 1;
      continue;
    }

    html.push(`<p>${formatInlineMarkdown(line)}</p>`);
    index += 1;
  }

  return html.join("\n");
}

export function htmlToPlainText(value: string) {
  if (!value) return "";
  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<h2[^>]*>/gi, "\n\n## ")
    .replace(/<\/h2>/gi, "\n\n")
    .replace(/<h3[^>]*>/gi, "\n\n### ")
    .replace(/<\/h3>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<strong[^>]*>/gi, "**")
    .replace(/<\/strong>/gi, "**")
    .replace(/<b[^>]*>/gi, "**")
    .replace(/<\/b>/gi, "**")
    .replace(/<em[^>]*>/gi, "*")
    .replace(/<\/em>/gi, "*")
    .replace(/<i[^>]*>/gi, "*")
    .replace(/<\/i>/gi, "*")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeBlogContent(content: string | null | undefined) {
  if (!content) return content ?? null;
  const decoded = decodeHtmlEntities(String(content).trim());
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(decoded);
  const hasStructuralTags = /<\/?(?:h2|h3|h4|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)\b/i.test(decoded);

  if (hasHtmlTags && hasStructuralTags) return decoded;
  if (hasHtmlTags) return plainTextToHtml(htmlToPlainText(decoded));
  return plainTextToHtml(decoded);
}
