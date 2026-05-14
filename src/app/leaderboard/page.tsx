import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const topStudents = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: 10,
    select: {
      fullName: true,
      grade: true,
      points: true
    }
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar (Dashboard ile aynı) */}
      <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', padding: '2rem' }}>
        <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>AtaPortal</h2>
        <nav>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/dashboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'hsl(var(--muted-foreground))' }}>Panel</a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/leaderboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--accent))', textDecoration: 'none', color: 'white' }}>Liderlik Tablosu</a>
            </li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1>Liderlik Tablosu 🏆</h1>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>En çok puan toplayan ilk 10 öğrenci.</p>
        </header>

        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ textAlign: 'left', padding: '1.5rem' }}>Sıra</th>
                <th style={{ textAlign: 'left', padding: '1.5rem' }}>Öğrenci</th>
                <th style={{ textAlign: 'left', padding: '1.5rem' }}>Sınıf</th>
                <th style={{ textAlign: 'right', padding: '1.5rem' }}>Toplam Puan</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((student: any, index: number) => (
                <tr key={index} style={{ borderBottom: '1px solid hsl(var(--border))', background: index === 0 ? 'rgba(250, 204, 21, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '1.5rem' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td style={{ padding: '1.5rem', fontWeight: index < 3 ? 'bold' : 'normal' }}>{student.fullName}</td>
                  <td style={{ padding: '1.5rem' }}>{student.grade}. Sınıf</td>
                  <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{student.points.toLocaleString()}</td>
                </tr>
              ))}
              {topStudents.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Henüz veri yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
