'use client';

import { BrainCircuit, UserRound, Bot, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';

type MessageCardProps = {
  message: ChatMessage;
};

export function MessageCard({ message }: MessageCardProps) {
  const [open, setOpen] = useState(true);
  const hasThinking = !!message.thinking?.length;

  return (
    <article className={cn('message-card', message.role === 'user' ? 'message-user' : 'message-assistant')}>
      <div className="message-head">
        <div className="message-identity">
          <div className="message-avatar">
            {message.role === 'user' ? <UserRound size={16} /> : <Bot size={16} />}
          </div>
          <div>
            <div className="message-role">{message.role === 'user' ? 'You' : 'Orbit Ink'}</div>
            <div className="message-time">{formatTime(message.createdAt)}</div>
          </div>
        </div>
      </div>

      <div className="message-content">{message.content}</div>

      {hasThinking && (
        <div className="thinking-wrap">
          <button className="thinking-toggle" onClick={() => setOpen((current) => !current)}>
            <div className="thinking-left">
              <BrainCircuit size={16} />
              <span>Thinking notes</span>
            </div>
            <ChevronDown size={16} className={cn('chevron', open && 'chevron-open')} />
          </button>

          {open && (
            <div className="thinking-panel">
              {message.thinking?.map((item, index) => (
                <div className="thinking-item" key={`${message.id}-thinking-${index}`}>
                  <span className="thinking-index">0{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
