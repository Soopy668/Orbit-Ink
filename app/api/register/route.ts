import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password || '';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Fill out every field before continuing.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Use at least 8 characters for your password.' },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'That email already has an account. Try logging in instead.' },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        credential: {
          create: {
            passwordHash,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Could not create the account right now.' },
      { status: 500 },
    );
  }
}
