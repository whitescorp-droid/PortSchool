import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { points, details } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: points },
        activities: {
          create: {
            type: 'QUESTION_SOLVED',
            points: points,
            details: details
          }
        }
      }
    });

    return NextResponse.json({ success: true, totalPoints: updatedUser.points });
  } catch (error) {
    console.error('Point Update Error:', error);
    return NextResponse.json({ error: 'Puan güncellenemedi.' }, { status: 500 });
  }
}
