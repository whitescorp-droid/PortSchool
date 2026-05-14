import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AIPanel from '@/components/AIPanel';

export default async function SubjectPage({ params }: { params: { subject: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  
  // Örnek konular (Normalde bir DB'den gelebilir ama yapay zekaya sormak için başlangıç noktası)
  const topics: Record<string, string[]> = {
    'matematik': ['Sayılar', 'Cebir', 'Geometri', 'Trigonometri', 'Türev', 'İntegral'],
    'fen-bilimleri': ['Hücre ve Bölünmeler', 'Kuvvet ve Enerji', 'Madde ve Isı', 'Vücudumuzdaki Sistemler'],
    'turkce': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Yazım Kuralları'],
    'sosyal-bilgiler': ['Tarih', 'Coğrafya', 'Vatandaşlık', 'Ekonomi'],
    'ingilizce': ['Vocabulary', 'Grammar', 'Reading', 'Writing'],
  };

  const subjectTopics = topics[params.subject] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', padding: '2rem' }}>
        <a href="/dashboard" style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          ← Geri Dön
        </a>
        <h2 style={{ marginBottom: '1rem' }}>{subjectName}</h2>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>Çalışmak istediğin konuyu seç.</p>
        
        <nav>
          {subjectTopics.map(topic => (
            <div key={topic} style={{ marginBottom: '0.5rem' }}>
              <button 
                className="btn" 
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  justifyContent: 'flex-start',
                  background: 'transparent',
                  border: '1px solid transparent',
                  padding: '0.5rem 1rem'
                }}
                // İleride client component ile seçim yapılacak
              >
                {topic}
              </button>
            </div>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '3rem' }}>
        <AIPanel subject={subjectName} />
      </main>
    </div>
  );
}
