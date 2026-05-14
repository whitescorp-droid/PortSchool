'use client';

import { useState } from 'react';
import { BookOpen, HelpCircle, Star, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AIPanel({ subject }: { subject: string }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const topics: Record<string, string[]> = {
    'Matematik': ['Sayılar', 'Cebir', 'Geometri', 'Trigonometri', 'Türev', 'İntegral'],
    'Fizik': ['Vektörler', 'Kuvvet ve Hareket', 'Elektrik ve Manyetizma', 'Optik', 'Modern Fizik'],
    'Kimya': ['Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Mol Kavramı', 'Organik Kimya'],
    'Biyoloji': ['Hücre', 'Kalıtım', 'Ekosistem Ekolojisi', 'Sistemler'],
    'Türk Dili ve Edebiyatı': ['Edebiyatın Esasları', 'Şiir', 'Roman', 'Tiyatro', 'Dil Bilgisi'],
    'Tarih': ['Tarih ve Zaman', 'İlk Çağ Medeniyetleri', 'Osmanlı Tarihi', 'İnkılap Tarihi'],
    'Coğrafya': ['Doğa ve İnsan', 'Dünyanın Şekli ve Hareketleri', 'Yerleşme ve Nüfus', 'Türkiye Coğrafyası'],
    'İngilizce': ['Vocabulary', 'Grammar', 'Reading', 'Writing'],
  };

  const currentTopics = topics[subject] || [];

  const generateContent = async (selectedTopic: string) => {
    setLoading(true);
    setError(null);
    setTopic(selectedTopic);
    setData(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic: selectedTopic, grade: '9' }),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setError(result.details || result.error || 'Bilinmeyen bir hata oluştu.');
        return;
      }
      
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError('Sunucuya bağlanırken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    data.questions.forEach((q: any) => {
      if (answers[q.id] === parseInt(q.correctAnswer)) {
        correctCount++;
      }
    });

    const totalPoints = correctCount * 10;
    setScore(totalPoints);
    setSubmitted(true);

    // Puanları veritabanına kaydet
    await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: totalPoints, details: `${subject} - ${topic}` }),
    });
  };

  if (!topic) {
    return (
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎓</div>
        <h2>Bir konu seçerek başla</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '3rem' }}>Senin için en iyi çalışma materyallerini hazırlayacağız.</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {currentTopics.map(t => (
            <button key={t} onClick={() => generateContent(t)} className="btn" style={{ background: 'hsl(var(--primary))', color: 'white' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '10vh', padding: '2rem' }}>
        <XCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h3 style={{ color: '#ef4444' }}>Yapay Zeka Hatası</h3>
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', margin: '1.5rem 0', padding: '1rem' }}>
          {error}
        </div>
        <button onClick={() => setTopic(null)} className="btn" style={{ background: 'hsl(var(--primary))' }}>
          Geri Dön ve Tekrar Dene
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '1.5rem' }} />
        <h3>Yapay Zeka İçeriği Hazırlıyor...</h3>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Notlar ve sorular oluşturuluyor.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <BookOpen size={24} style={{ color: 'hsl(var(--primary))' }} />
          <h2>Ders Notları: {topic}</h2>
        </div>
        <div className="card glass" style={{ lineHeight: '1.6', fontSize: '1.125rem', whiteSpace: 'pre-wrap' }}>
          {data?.content}
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <HelpCircle size={24} style={{ color: 'hsl(var(--primary))' }} />
          <h2>Konu Testi</h2>
        </div>

        {data?.questions.map((q: any) => (
          <div key={q.id} className="card" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: '500', marginBottom: '1.5rem', fontSize: '1.125rem' }}>{q.id}. {q.question}</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {q.options.map((option: string, index: number) => {
                const isSelected = answers[q.id] === index;
                const isCorrect = index === parseInt(q.correctAnswer);
                let bg = 'hsl(var(--secondary))';
                if (submitted) {
                  if (isCorrect) bg = '#065f46';
                  else if (isSelected) bg = '#7f1d1d';
                } else if (isSelected) {
                  bg = 'hsl(var(--primary))';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(q.id, index)}
                    disabled={submitted}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid hsl(var(--border))',
                      background: bg,
                      color: 'white',
                      textAlign: 'left',
                      cursor: submitted ? 'default' : 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{['A', 'B', 'C', 'D'][index]}) {option}</span>
                    {submitted && isCorrect && <CheckCircle size={18} />}
                    {submitted && isSelected && !isCorrect && <XCircle size={18} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1.5rem', fontSize: '1.125rem' }}
            disabled={Object.keys(answers).length < data?.questions.length}
          >
            Testi Tamamla ve Puan Kazan
          </button>
        ) : (
          <div className="card" style={{ textAlign: 'center', border: '2px solid hsl(var(--primary))' }}>
            <Star size={48} style={{ color: 'gold', marginBottom: '1rem' }} />
            <h3>Tebrikler!</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{score} Puan Kazandın</p>
            <button onClick={() => setTopic(null)} className="btn" style={{ marginTop: '1rem', background: 'hsl(var(--secondary))' }}>
              Başka Bir Konu Çalış
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
