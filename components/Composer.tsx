'use client';

import { Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
};

export function Composer({ value, onChange, onSend, loading }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [value]);

  return (
    <div className="composer-shell">
      <div className="composer-chip">
        <Sparkles size={15} />
        <span>Thinking mode enabled</span>
      </div>

      <div className="composer-grid">
        <textarea
          ref={textareaRef}
          className="composer-input"
          placeholder="Ask for ideas, code, writing, plans, or a wild concept..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={1}
        />

        <button
          className="send-button"
          onClick={onSend}
          disabled={loading || !value.trim()}
          aria-label="Send message"
        >
          {loading ? <Loader2 size={18} className="spin" /> : <ArrowUpRight size={18} />}
        </button>
      </div>
    </div>
  );
}
