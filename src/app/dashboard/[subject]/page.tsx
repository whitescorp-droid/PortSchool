import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AIPanel from '@/components/AIPanel';

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const subjectName = decodedSubject.charAt(0).toUpperCase() + decodedSubject.slice(1);
  
  // Örnek konular (Normalde bir DB'den gelebilir ama yapay zekaya sormak için başlangıç noktası)
  const topics: Record<string, string[]> = {
    'matematik': ['Sayılar', 'Cebir', 'Geometri', 'Trigonometri', 'Türev', 'İntegral'],
    'fizik': ['Vektörler', 'Kuvvet ve Hareket', 'Elektrik ve Manyetizma', 'Optik', 'Modern Fizik'],
    'kimya': ['Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Mol Kavramı', 'Organik Kimya'],
    'biyoloji': ['Hücre', 'Kalıtım', 'Ekosistem Ekolojisi', 'Sistemler'],
    'turk-dili-ve-edebiyati': ['Edebiyatın Esasları', 'Şiir', 'Roman', 'Tiyatro', 'Dil Bilgisi'],
    'tarih': ['Tarih ve Zaman', 'İlk Çağ Medeniyetleri', 'Osmanlı Tarihi', 'İnkılap Tarihi'],
    'cografya': ['Doğa ve İnsan', 'Dünyanın Şekli ve Hareketleri', 'Yerleşme ve Nüfus', 'Türkiye Coğrafyası'],
    'ingilizce': ['Vocabulary', 'Grammar', 'Reading', 'Writing'],
  };

  const subjectTopics = topics[decodedSubject] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', padding: '2rem' }}>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', opacity: 0.8 }}>
          ← Geri Dön
        </a>
        <h2 style={{ marginBottom: '1rem', color: 'white' }}>{subjectName}</h2>
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
                  padding: '0.5rem 1rem',
                  color: 'white'
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
