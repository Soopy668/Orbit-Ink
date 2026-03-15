import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = (await request.json()) as {
      messages?: IncomingMessage[];
      viewerName?: string;
      guest?: boolean;
    };

    const messages = body.messages ?? [];
    const viewerName = body.viewerName?.trim();
    const guest = Boolean(body.guest);

    const systemPrompt = `You are Orbit Ink, a stylish creative assistant inside a futuristic web app.
Your job is to answer helpfully and clearly.
Also produce a short user-visible thinking summary.
Do not reveal private chain-of-thought.
Instead, return concise high-level reasoning notes.
Respond strictly as JSON with keys: reply, thinking.
The thinking value must be an array of exactly 3 short strings.
${viewerName ? `The current signed-in or active user is ${viewerName}. Use their name only when it feels natural.` : ''}`;

    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as { reply?: string; thinking?: string[] };

    const reply = parsed.reply || 'I was unable to generate a reply.';
    const thinking = Array.isArray(parsed.thinking) ? parsed.thinking.slice(0, 3) : [];

    const userId = session?.user?.id;
    if (userId && !guest && messages.length) {
      const conversation = await prisma.conversation.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          title: 'Main Orbit',
        },
      });

      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === 'user') {
        const alreadySaved = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
            role: 'user',
            content: lastUserMessage.content,
          },
          orderBy: { createdAt: 'desc' },
        });

        const shouldSaveUserMessage =
          !alreadySaved ||
          Math.abs(new Date(alreadySaved.createdAt).getTime() - Date.now()) > 4000;

        if (shouldSaveUserMessage) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'user',
              content: lastUserMessage.content,
            },
          });
        }
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: reply,
          thinking,
        },
      });
    }

    return NextResponse.json({ reply, thinking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        reply: 'The chat endpoint hit an error.',
        thinking: [
          'The server could not complete the model request.',
          'Check API credentials and deployment logs.',
          'Then retry the same prompt.',
        ],
      },
      { status: 500 },
    );
  }
}
