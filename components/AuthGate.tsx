'use client';

import { useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowRight, LockKeyhole, Orbit, Sparkles, UserPlus, UserRound } from 'lucide-react';

type AuthGateProps = {
  onGuest: () => void;
};

type Mode = 'login' | 'register';

export function AuthGate({ onGuest }: AuthGateProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const title = useMemo(
    () =>
      mode === 'login'
        ? 'Welcome back to a stranger kind of chat space.'
        : 'Create a profile and step into the studio.',
    [mode],
  );

  async function handleManualSubmit() {
    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      setError('Fill out every field before continuing.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (mode === 'register') {
        const registerResponse = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const registerData = (await registerResponse.json()) as { error?: string };
        if (!registerResponse.ok) {
          throw new Error(registerData.error || 'Could not create your account.');
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error('That email and password combination was not accepted.');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong signing you in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="welcome-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="grid-noise" />

      <section className="welcome-stage">
        <div className="welcome-showcase glass-card">
          <div className="welcome-badge">
            <Orbit size={18} />
            <span>Orbit Ink</span>
          </div>

          <h1>A cinematic AI workspace with its own orbit.</h1>
          <p className="welcome-copy">
            Not a generic chat clone. This one opens like a digital studio, reveals thinking notes,
            and feels more like a creative control deck than a support box.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <Sparkles size={18} />
              <strong>Thinking panels</strong>
              <span>High-level reasoning notes under every answer.</span>
            </div>
            <div className="feature-card">
              <LockKeyhole size={18} />
              <strong>Real database auth</strong>
              <span>Google plus manual sign-in powered by Prisma and Auth.js.</span>
            </div>
            <div className="feature-card">
              <UserPlus size={18} />
              <strong>Guest mode</strong>
              <span>Jump in instantly without saving your chat history.</span>
            </div>
          </div>
        </div>

        <div className="auth-panel glass-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Register
            </button>
          </div>

          <div className="auth-copy-block">
            <p className="eyebrow">Enter the studio</p>
            <h2>{title}</h2>
            <p className="subtle-copy">
              Use Google, sign in with email and password, or explore in guest mode with no saved conversations.
            </p>
          </div>

          <button className="oauth-button" onClick={() => signIn('google', { callbackUrl: '/' })}>
            <span className="google-mark">G</span>
            <span>Continue with Google</span>
            <ArrowRight size={16} />
          </button>

          <div className="auth-divider"><span>or use email</span></div>

          <div className="auth-form">
            {mode === 'register' && (
              <label className="field-block">
                <span>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
            )}

            <label className="field-block">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="field-block">
              <span>Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleManualSubmit();
                }}
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button className="primary-auth-button" onClick={handleManualSubmit} disabled={busy}>
              <span>{busy ? 'Working...' : mode === 'login' ? 'Login manually' : 'Create account'}</span>
              <ArrowRight size={16} />
            </button>

            <button className="guest-button" onClick={onGuest} disabled={busy}>
              <UserRound size={16} />
              <span>Continue as guest</span>
            </button>
          </div>

          <p className="tiny-note">
            Signed-in accounts save one live conversation to your database. Guest mode stays private to the current session.
          </p>
        </div>
      </section>
    </main>
  );
}
