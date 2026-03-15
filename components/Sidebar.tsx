'use client';

import { Compass, Paintbrush, PanelTop, Sparkles, Zap } from 'lucide-react';

const prompts = [
  'Design a fantasy landing page for my Minecraft server.',
  'Plan a YouTube series around weird internet history.',
  'Write a game pitch with crafting, bosses, and co-op.',
  'Turn my rough idea into a startup homepage and brand voice.',
];

type SidebarProps = {
  currentUser?: string;
  onPromptClick: (prompt: string) => void;
  onReset: () => void;
};

export function Sidebar({ currentUser, onPromptClick, onReset }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-panel">
        <div className="brand-badge">OI</div>
        <div>
          <p className="eyebrow">Creative intelligence space</p>
          <h1>Orbit Ink</h1>
        </div>
      </div>

      <div className="sidebar-section stat-block">
        <div className="stat-row"><Compass size={16} /> Distinctive UI</div>
        <div className="stat-row"><Zap size={16} /> Fast Vercel deploy</div>
        <div className="stat-row"><Paintbrush size={16} /> Art-directed visuals</div>
        <div className="stat-row"><PanelTop size={16} /> Thinking panel built in</div>
      </div>

      <div className="sidebar-section presence-card">
        <div className="presence-head">
          <Sparkles size={16} />
          <span>Session</span>
        </div>
        <strong>{currentUser || 'Guest'}</strong>
        <p>Your personal creative cockpit is ready.</p>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Prompt sparks</div>
        <div className="prompt-list">
          {prompts.map((prompt) => (
            <button key={prompt} className="prompt-card" onClick={() => onPromptClick(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <button className="reset-button" onClick={onReset}>New thread</button>
    </aside>
  );
}
