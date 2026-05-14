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
    <div style={{ minHeight: '100vh' }}>
      <AIPanel subject={subjectName} />
    </div>
  );
}
