// PDF Generator — Premium beautiful PDFs with Red Whale branding
import { jsPDF } from 'jspdf';

/* ─── constants ─── */
const MM_PER_PT = 0.3528;
const LINE_FACTOR = 1.2;
const SAFE_REGEX = /[^\u0020-\u007E\u0900-\u097F\u00B0\u00BD\u00A0\n\r\t]/g;

/* ─── helpers ─── */
function getLineHeight(fontSizePt: number): number {
  return fontSizePt * MM_PER_PT * LINE_FACTOR;
}

function collapseSpacedLetters(line: string): string {
  const trimmed = line.trim();
  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 3) return line;
  const singleLetters = tokens.filter((t) => /^[A-Za-z]$/.test(t)).length;
  if (singleLetters / tokens.length <= 0.4) return line;
  const out: string[] = [];
  let run: string[] = [];
  const flush = () => { if (run.length) { out.push(run.join('')); run = []; } };
  for (const tok of tokens) {
    if (/^[A-Za-z]$/.test(tok)) run.push(tok);
    else { flush(); out.push(tok); }
  }
  flush();
  return out.join(' ');
}

function cleanText(text: string): string {
  let t = text;
  t = t.replace(/```[\s\S]*?```/g, '');
  t = t.replace(/`([^`]*)`/g, '$1');
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/\*([^*]+)\*/g, '$1');
  t = t.replace(/__([^_]+)__/g, '$1');
  t = t.replace(/_([^_]+)_/g, '$1');
  t = t.replace(/^#{1,6}\s+/gm, '');
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  t = t.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');
  t = t.replace(/https?:\/\/[^\s]+/g, '');
  t = t.replace(/\|/g, '');
  t = t.replace(/^\s*[-:]+[-\s:]*\s*$/gm, '');
  t = t.replace(SAFE_REGEX, '');
  t = t.replace(/^\s*=?\d+\s*/gm, '');
  t = t.replace(/^\s*[<>=]+\s*/gm, '');
  t = t.split('\n').map(collapseSpacedLetters).join('\n');
  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

function getDateStr(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isBulletLine(line: string): boolean {
  return /^\s*[\-\*•]\s+/.test(line);
}

function isNumberedLine(line: string): boolean {
  return /^\s*\d+\.\s+/.test(line);
}

/* ─── detect whether a PDF button should show ─── */
export function isStructuredContent(text: string): boolean {
  const hasTable = /\|.+/m.test(text);
  const hasSchedule = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|time|schedule|timetable|routine|plan|report|summary|table|chart|list|ingredient|step|material|recipe|steps|ingredients)\b/i.test(text);
  const hasHeadings = /^#{1,6}\s+/m.test(text);
  const hasLists = /^\s*[\-\*•]\s+/m.test(text);
  return hasTable || (hasSchedule && (hasHeadings || hasLists));
}

/* ─── main PDF builder ─── */
export async function generatePDF(rawContent: string, title = 'Red Whale Document'): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const M = 20;
  const CW = PW - M * 2 - 4;

  const content = cleanText(rawContent);
  const docTitle = cleanText(title).slice(0, 60);

  const RED_R = 185, RED_G = 28,  RED_B = 28;
  const DARK_R = 31,  DARK_G = 41, DARK_B = 55;
  const MUTED_R = 107, MUTED_G = 114, MUTED_B = 128;

  /* ═══════ COVER PAGE ═══════ */
  // Red banner with subtle bottom edge
  doc.setFillColor(RED_R, RED_G, RED_B);
  doc.rect(0, 0, PW, 60, 'F');
  doc.setFillColor(127, 29, 29);
  doc.rect(0, 58, PW, 2, 'F');

  // Decorative white lines on right of banner
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  for (let i = 0; i < 6; i++) {
    doc.line(PW - 55, 6 + i * 8, PW - 8, 6 + i * 8);
  }

  // RED WHALE brand — bold, big, white
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text('RED WHALE', M, 32);

  // Subtitle
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text('AI-Powered Intelligence', M, 42);

  // Concentric white circles on right
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.circle(PW - M - 14, 32, 10, 'S');
  doc.circle(PW - M - 14, 32, 5, 'S');
  doc.setFillColor(255, 255, 255);
  doc.circle(PW - M - 14, 32, 2, 'F');

  // Title below banner
  let y = 76;
  doc.setTextColor(DARK_R, DARK_G, DARK_B);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  const titleLines = doc.splitTextToSize(docTitle, CW);
  doc.text(titleLines, M, y);
  y += titleLines.length * getLineHeight(24) + 4;

  // Red underline
  doc.setDrawColor(RED_R, RED_G, RED_B);
  doc.setLineWidth(1);
  const tw = doc.getTextWidth(docTitle);
  doc.line(M, y, M + Math.min(tw, CW), y);
  y += 10;

  // Date in muted
  doc.setTextColor(MUTED_R, MUTED_G, MUTED_B);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(getDateStr(), M, y);
  y += 14;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(M, y, PW - M, y);

  /* ═══════ CONTENT PAGES ═══════ */
  const lines = content.split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      y += getLineHeight(10) * 0.5;
      continue;
    }

    // STRICT heading: 2-6 words, ALL words capitalized, <40 chars
    const words = line.split(/\s+/).filter(Boolean);
    const allTitleCase = words.length >= 2 && words.length <= 6 && words.every((w) => /^[A-Z0-9]/.test(w));
    const looksLikeHeading = allTitleCase && line.length < 40 &&
      !/\b(and|the|for|with|from|into|onto|upon|this|that|these|those|when|where|because|since|while|during|before|after|above|below|between|under|over|again|further|then|once|here|there|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|can|will|just|should|now)\b/i.test(words[0] || '');

    const isBullet = isBulletLine(raw);
    const isNumbered = isNumberedLine(raw);

    let fontSize = 10;
    let fontStyle: 'normal' | 'bold' = 'normal';
    let indent = 0;
    let body = line;

    if (looksLikeHeading) {
      fontSize = 11;
      fontStyle = 'bold';
    } else if (isBullet) {
      body = line.replace(/^\s*[\-\*•]\s+/, '');
      indent = 5;
    } else if (isNumbered) {
      const m = line.match(/^\s*(\d+)\.\s+(.*)/);
      body = m ? m[2] : line;
      indent = 8;
    }

    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);

    const wrapped = doc.splitTextToSize(body, CW - indent);
    const lineH = getLineHeight(fontSize);
    const blockH = wrapped.length * lineH;
    const extraPad = looksLikeHeading ? 6 : 3;
    const needed = blockH + extraPad + 3;

    // Page break before rendering
    if (y + needed > PH - M - 10) {
      doc.addPage();
      doc.setFillColor(252, 252, 252);
      doc.rect(0, 0, PW, PH, 'F');
      doc.setFillColor(RED_R, RED_G, RED_B);
      doc.rect(0, 0, PW, 1.2, 'F');
      doc.setFillColor(RED_R, RED_G, RED_B);
      doc.rect(0, 0, 1.2, PH, 'F');
      // Watermark
      doc.setTextColor(238, 238, 238);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(44);
      doc.text('RED WHALE', PW / 2, PH / 2, { align: 'center', angle: 45 });
      y = M;
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
    }

    if (looksLikeHeading) {
      // Red left accent bar
      doc.setFillColor(RED_R, RED_G, RED_B);
      const barH = Math.max(blockH + 4, 9);
      doc.rect(M - 2, y - lineH * 0.3, 2.5, barH, 'F');

      // Light red background strip
      doc.setFillColor(254, 242, 242);
      doc.rect(M + 1, y - lineH * 0.3, CW - 3, barH, 'F');

      doc.setTextColor(RED_R, RED_G, RED_B);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.text(wrapped, M + 4, y);
      y += blockH + 8;
    } else if (isBullet) {
      // Red square bullet
      doc.setFillColor(RED_R, RED_G, RED_B);
      doc.rect(M, y - 2.5, 2.2, 2.2, 'F');

      doc.setTextColor(DARK_R, DARK_G, DARK_B);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.text(wrapped, M + indent, y);
      y += blockH + 4;
    } else if (isNumbered) {
      const num = line.match(/^\s*(\d+)\.\s+/)?.[1] ?? '';
      // Red pill
      doc.setFillColor(RED_R, RED_G, RED_B);
      doc.roundedRect(M, y - 4, 7, 6, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(num, M + 3.5, y - 0.5, { align: 'center' });

      doc.setTextColor(DARK_R, DARK_G, DARK_B);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.text(wrapped, M + indent, y);
      y += blockH + 4;
    } else {
      doc.setTextColor(DARK_R, DARK_G, DARK_B);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.text(wrapped, M, y);
      y += blockH + 4;
    }
  }

  /* ═══════ FOOTER (skip cover) ═══════ */
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p === 1) continue;

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 14, PW - M, PH - 14);

    doc.setTextColor(MUTED_R, MUTED_G, MUTED_B);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Generated by Red Whale V2', M, PH - 8);

    doc.setDrawColor(RED_R, RED_G, RED_B);
    doc.setLineWidth(0.3);
    doc.circle(PW - M - 5, PH - 9, 3.5, 'S');
    doc.setTextColor(RED_R, RED_G, RED_B);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`${p - 1}`, PW - M - 5, PH - 8, { align: 'center' });
  }

  return doc.output('datauristring');
}

export function downloadPDF(dataUri: string, filename = 'red-whale-document.pdf'): void {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  link.click();
}
