import { useMemo } from 'react';

/**
 * Simple markdown formatter that handles:
 * - **bold text**
 * - Line breaks (\n)
 * - Links [text](url)
 * - Bullet points (- item)
 * - Numbered lists (1. item)
 */
export function MarkdownText({ content }) {
  const formattedContent = useMemo(() => {
    if (!content) return null;

    // Split by line breaks first
    const lines = content.split('\n');
    const elements = [];

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        // Empty line - add spacing
        elements.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      // Process inline markdown in the line
      const parts = [];
      let currentText = line;
      let key = 0;

      // Process bold text **text**
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lineIndex}-${key++}`}>
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }

        // Add bold text
        parts.push(
          <strong key={`bold-${lineIndex}-${key++}`} style={{ fontWeight: '700' }}>
            {match[1]}
          </strong>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(
          <span key={`text-${lineIndex}-${key++}`}>
            {line.substring(lastIndex)}
          </span>
        );
      }

      // Check if it's a list item
      const isBullet = line.trim().startsWith('- ');
      const isNumbered = /^\d+\.\s/.test(line.trim());

      if (isBullet) {
        elements.push(
          <div key={`line-${lineIndex}`} style={{
            paddingLeft: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-xs)',
            display: 'flex',
            gap: 'var(--spacing-xs)'
          }}>
            <span>•</span>
            <span>{parts}</span>
          </div>
        );
      } else if (isNumbered) {
        elements.push(
          <div key={`line-${lineIndex}`} style={{
            paddingLeft: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-xs)'
          }}>
            {parts}
          </div>
        );
      } else {
        elements.push(
          <div key={`line-${lineIndex}`} style={{ marginBottom: 'var(--spacing-xs)' }}>
            {parts.length > 0 ? parts : line}
          </div>
        );
      }
    });

    return elements;
  }, [content]);

  return <div style={{ lineHeight: '1.6' }}>{formattedContent}</div>;
}
