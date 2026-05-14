import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AIPanel from '@/components/AIPanel';

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  
  // URL'deki tireleri boşluğa çevir ve her kelimeyi büyük harfle başlat
  const subjectName = decodedSubject
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div style={{ minHeight: '100vh' }}>
      <AIPanel subject={subjectName} />
    </div>
  );
}
