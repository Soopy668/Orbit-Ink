'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Composer } from '@/components/Composer';
import { MessageCard } from '@/components/MessageCard';
import { AuthGate } from '@/components/AuthGate';
import type { ChatMessage } from '@/lib/types';
import { uid } from '@/lib/utils';

const starter = (name?: string, guest = false): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: `Welcome${name ? `, ${name}` : ''} to Orbit Ink. ${guest ? 'You are in guest mode, so nothing here will be saved after you leave.' : 'This is your saved studio thread, ready to pick back up anytime.'}`,
  thinking: guest
    ? [
        'I explain that guest mode is temporary right away.',
        'I keep the first reply short so the layout stays clean.',
        'I reinforce that this space is for making things, not just chatting.',
      ]
    : [
        'I frame the workspace as a creative studio instead of a generic support bot.',
        'I make persistence feel helpful without sounding technical.',
        'I keep the opening concise so the UI stays cinematic.',
      ],
  createdAt: Date.now(),
});

export default function HomePage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [bootingConversation, setBootingConversation] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeUser = useMemo(() => {
    if (session?.user?.email) {
      return {
        name: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        source: 'account' as const,
      };
    }

    if (guestMode) {
      return {
        name: 'Guest Explorer',
        email: null,
        source: 'guest' as const,
      };
    }

    return null;
  }, [guestMode, session]);

  useEffect(() => {
    async function loadConversation() {
      if (status === 'loading') return;

      if (!activeUser) {
        setMessages([]);
        setBootingConversation(false);
        return;
      }

      if (activeUser.source === 'guest') {
        setMessages([starter(activeUser.name, true)]);
        setBootingConversation(false);
        return;
      }

      setBootingConversation(true);
      try {
        const response = await fetch('/api/conversation', { cache: 'no-store' });
        const data = (await response.json()) as { messages?: ChatMessage[] };
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages);
        } else {
          setMessages([starter(activeUser.name)]);
        }
      } catch {
        setMessages([starter(activeUser.name)]);
      } finally {
        setBootingConversation(false);
      }
    }

    loadConversation();
  }, [activeUser, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const conversationPayload = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading || !activeUser) return;

    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    const nextConversation = [...conversationPayload, { role: 'user' as const, content: trimmed }];

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextConversation,
          viewerName: activeUser.name,
          guest: activeUser.source === 'guest',
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = (await response.json()) as { reply: string; thinking: string[] };
      const assistantMessage: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: data.reply,
        thinking: data.thinking,
        createdAt: Date.now(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content:
            'Something went wrong talking to the model. Check your API key, deployment environment variables, and network request logs.',
          thinking: [
            'The request likely failed before the model returned a response.',
            'Most setup issues come from missing environment variables.',
            'Vercel function logs will usually show the exact error.',
          ],
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!activeUser) return;

    const first = starter(activeUser.name, activeUser.source === 'guest');
    setMessages([first]);

    if (activeUser.source !== 'guest') {
      await fetch('/api/conversation', { method: 'DELETE' });
    }
  }

  async function handleLogout() {
    if (activeUser?.source === 'guest') {
      setGuestMode(false);
      setMessages([]);
      return;
    }

    await signOut({ callbackUrl: '/' });
  }

  if (status === 'loading' || (activeUser && bootingConversation)) {
    return <main className="loading-screen">Loading Orbit Ink…</main>;
  }

  if (!activeUser) {
    return <AuthGate onGuest={() => setGuestMode(true)} />;
  }

  return (
    <main className="page-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="grid-noise" />

      <Sidebar currentUser={activeUser.name} onPromptClick={(prompt) => setInput(prompt)} onReset={handleReset} />

      <section className="chat-stage">
        <header className="hero-panel">
          <div>
            <p className="eyebrow">Neural canvas</p>
            <h2>Build with a chatbot that feels like a studio tool.</h2>
          </div>
          <div className="hero-copy">
            <div className="user-pill-row">
              <div className="user-pill">
                <span className="user-pill-label">{activeUser.source === 'guest' ? 'Browsing as' : 'Signed in as'}</span>
                <strong>{activeUser.name}</strong>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={15} />
                <span>{activeUser.source === 'guest' ? 'Exit guest' : 'Log out'}</span>
              </button>
            </div>
            {activeUser.source === 'guest'
              ? 'Guest mode keeps everything ephemeral. You can test prompts freely, but chats vanish when you leave.'
              : 'Orbit Ink now stores signed-in users and their main conversation in a real Prisma database, while keeping the same custom studio vibe.'}
          </div>
        </header>

        <div className="messages-wrap" ref={scrollRef}>
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}

          {loading && (
            <div className="typing-card">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
              <span>Orbit Ink is thinking...</span>
            </div>
          )}
        </div>

        <Composer value={input} onChange={setInput} onSend={sendMessage} loading={loading} />
      </section>
    </main>
  );
}
