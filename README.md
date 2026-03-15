# Orbit Ink

A Vercel-ready chatbot with a cinematic, non-generic UI, visible thinking summaries, Google login, manual email/password auth, database-backed users and conversations, and a guest mode that does not save chats.

## Stack

- Next.js App Router
- Auth.js with Google + Credentials provider
- Prisma ORM
- PostgreSQL for production on Vercel
- OpenAI for responses

## Features

- Welcome screen with **Login**, **Register**, and **Continue as guest**
- Google OAuth sign-in
- Manual email/password registration and login backed by a real database
- One saved main conversation per signed-in user
- Guest mode with **no saved conversation history**
- Custom Orbit Ink UI that avoids the standard chatbot clone look
- Assistant thinking summaries shown as visible notes under replies

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
AUTH_SECRET=replace_with_a_long_random_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
DATABASE_URL=your_postgres_connection_string
```

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

## Vercel deploy notes

1. Create a Postgres database and copy its connection string into `DATABASE_URL`.
2. Add all environment variables in Vercel Project Settings.
3. Run `npm run db:push` against that database before first use, or from your deploy workflow.
4. Set Google OAuth callback URLs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`

## Database schema

The Prisma schema includes:

- Auth.js default models: `User`, `Account`, `Session`, `VerificationToken`
- `Credential` for manual password hashes
- `Conversation` for each signed-in user’s main saved chat
- `Message` for stored user and assistant messages

## Important behavior

- Signed-in users: conversation is stored in the database.
- Guest mode: messages stay only in memory for the current tab session and are not written to the database.
- Thinking notes are high-level summaries, not hidden chain-of-thought.
