/**
 * Renders Gemini's **bold** / bullet / paragraph output as real HTML.
 * Supports: **Section Title** headings, • / - bullets, inline **bold**.
 */
export default function SimpleMarkdown({ text, className }) {
  if (!text) return null;

  const blocks = [];
  const paragraphs = text.split(/\n{2,}/);

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);

    // Section heading: **Title** alone on a line
    if (lines.length === 1 && /^\*\*[^*]+\*\*$/.test(lines[0])) {
      blocks.push(
        <h4 key={i} style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: 4, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {lines[0].replace(/\*\*/g, '')}
        </h4>
      );
      continue;
    }

    // Bullet list
    if (lines.every(l => /^[•\-\*]\s/.test(l))) {
      blocks.push(
        <ul key={i} style={{ paddingLeft: 18, margin: '4px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {lines.map((l, j) => (
            <li key={j} style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.6 }}>
              {inlineBold(l.replace(/^[•\-\*]\s/, ''))}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Mixed paragraph (may have a heading on first line)
    if (/^\*\*[^*]+\*\*$/.test(lines[0]) && lines.length > 1) {
      blocks.push(
        <div key={i}>
          <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: 4, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {lines[0].replace(/\*\*/g, '')}
          </h4>
          <p style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.65, margin: 0 }}>
            {inlineBold(lines.slice(1).join(' '))}
          </p>
        </div>
      );
      continue;
    }

    // Plain paragraph
    blocks.push(
      <p key={i} style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.65, margin: '4px 0' }}>
        {inlineBold(lines.join(' '))}
      </p>
    );
  }

  return <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{blocks}</div>;
}

function inlineBold(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: '#0f172a' }}>{part}</strong> : part
  );
}
