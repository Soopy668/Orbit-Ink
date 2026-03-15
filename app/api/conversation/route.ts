import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ messages: [] });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      thinking: Array.isArray(message.thinking) ? message.thinking : [],
      createdAt: new Date(message.createdAt).getTime(),
    })),
  });
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  const conversation = await prisma.conversation.findUnique({ where: { userId } });
  if (conversation) {
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
  }

  return NextResponse.json({ ok: true });
}
