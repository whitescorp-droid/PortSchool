import { getSession, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { activities: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });
  } catch (error) {
    console.error('Database fetch error:', error);
  }

  if (!user && session) {
     // Kullanıcı silinmiş veya bulunamıyor olabilir
     await logout();
     redirect('/login');
  }

  const subjects = [
    { name: 'Matematik', icon: '📐' },
    { name: 'Fen Bilimleri', icon: '🧪' },
    { name: 'Türkçe', icon: '📚' },
    { name: 'Sosyal Bilgiler', icon: '🌍' },
    { name: 'İngilizce', icon: '🇬🇧' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>AtaPortal</h2>
        
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/dashboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--accent))', textDecoration: 'none', color: 'white' }}>Panel</a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/leaderboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'hsl(var(--muted-foreground))' }}>Liderlik Tablosu</a>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user?.fullName}</p>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>{user?.grade}. Sınıf</p>
          <form action={async () => { 'use server'; await logout(); redirect('/login'); }}>
            <button className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid hsl(var(--border))', color: 'red' }}>Çıkış Yap</button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Merhaba, {user?.fullName.split(' ')[0]} 👋</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Bugün ne öğrenmek istersin?</p>
          </div>
          <div className="card" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Toplam Puan</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{user?.points}</p>
            </div>
          </div>
        </header>

        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Ders Seçimi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {subjects.map((subject) => (
              <a 
                key={subject.name}
                href={`/dashboard/${subject.name.toLowerCase().replace(/ /g, '-')}`}
                className="card subject-card" 
                style={{ 
                  textDecoration: 'none', 
                  textAlign: 'center', 
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>{subject.icon}</span>
                <span style={{ fontWeight: '500' }}>{subject.name}</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Son Aktiviteler</h3>
          <div className="card" style={{ padding: 0 }}>
            {user?.activities.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Henüz aktivite yok. Bir ders seçerek başla!</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Aktivite</th>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Detay</th>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Puan</th>
                    <th style={{ textAlign: 'right', padding: '1rem' }}>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {user?.activities?.map((activity: any) => (
                    <tr key={activity.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '1rem' }}>{activity.type === 'QUESTION_SOLVED' ? 'Soru Çözüldü' : 'Ders Çalışıldı'}</td>
                      <td style={{ padding: '1rem' }}>{activity.details}</td>
                      <td style={{ padding: '1rem', color: '#10b981' }}>+{activity.points}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
