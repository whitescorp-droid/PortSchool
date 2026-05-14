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
    'matematik': ['Sayılar', 'Cebir', 'Geometri', 'Trigonometri', 'Türev', 'İntegral'],
    'fizik': ['Vektörler', 'Kuvvet ve Hareket', 'Elektrik ve Manyetizma', 'Optik', 'Modern Fizik'],
    'kimya': ['Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Mol Kavramı', 'Organik Kimya'],
    'biyoloji': ['Hücre', 'Kalıtım', 'Ekosistem Ekolojisi', 'Sistemler'],
    'türk dili ve edebiyatı': ['Edebiyatın Esasları', 'Şiir', 'Roman', 'Tiyatro', 'Dil Bilgisi'],
    'tarih': ['Tarih ve Zaman', 'İlk Çağ Medeniyetleri', 'Osmanlı Tarihi', 'İnkılap Tarihi'],
    'coğrafya': ['Doğa ve İnsan', 'Dünyanın Şekli ve Hareketleri', 'Yerleşme ve Nüfus', 'Türkiye Coğrafyası'],
    'ingilizce': ['Vocabulary', 'Grammar', 'Reading', 'Writing'],
  };

  const currentTopics = topics[subject.toLowerCase()] || [];

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

    await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: totalPoints, details: `${subject} - ${topic}` }),
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Client-Side Sidebar */}
      <aside style={{ 
        width: '300px', 
        backgroundColor: 'rgba(15, 15, 20, 0.95)', 
        borderRight: '1px solid rgba(255,255,255,0.1)', 
        padding: '2rem', 
        height: '100vh', 
        position: 'sticky', 
        top: 0,
        zIndex: 50
      }}>
        <a href="/dashboard" style={{ 
          color: 'rgba(255,255,255,0.6)', 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '2.5rem',
          fontSize: '0.9rem'
        }}>
          ← Panel'e Dön
        </a>
        <h2 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.75rem' }}>{subject}</h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>Lütfen bir konu seçin.</p>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentTopics.map(t => (
            <button 
              key={t}
              onClick={() => generateContent(t)}
              disabled={loading}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                padding: '1rem',
                borderRadius: '12px',
                background: topic === t ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (topic === t ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'),
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading && topic !== t ? 0.5 : 1
              }}
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main style={{ flex: 1, padding: '3rem' }}>
        {!topic && !loading && !error && (
          <div style={{ textAlign: 'center', marginTop: '15vh' }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>✨</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Öğrenmeye Hazır Mısın?</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>Sol menüden bir konu seçerek sana özel ders notlarını ve testleri anında oluşturabilirsin.</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', marginTop: '10vh', padding: '2rem', maxWidth: '600px', margin: '10vh auto' }}>
            <XCircle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Hata</h3>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#f87171', 
              padding: '1.5rem',
              borderRadius: '16px',
              marginBottom: '2rem'
            }}>
              {error}
            </div>
            <button onClick={() => setTopic(null)} className="btn btn-primary">
              Tekrar Dene
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={64} style={{ color: 'hsl(var(--primary))', marginBottom: '2rem' }} />
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>{topic} Hazırlanıyor...</h2>
          </div>
        )}

        {data && !loading && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <BookOpen size={28} style={{ color: 'hsl(var(--primary))' }} />
                <h1 style={{ fontSize: '2.5rem' }}>{topic}</h1>
              </div>
              <div className="card glass" style={{ 
                lineHeight: '1.8', 
                fontSize: '1.125rem', 
                whiteSpace: 'pre-wrap',
                padding: '2.5rem',
                borderRadius: '24px'
              }}>
                {data?.content}
              </div>
            </div>

            <div style={{ marginBottom: '5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <HelpCircle size={28} style={{ color: 'hsl(var(--primary))' }} />
                <h2 style={{ fontSize: '2rem' }}>Konu Testi</h2>
              </div>

              {data?.questions.map((q: any) => (
                <div key={q.id} className="card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: '24px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '2rem', fontSize: '1.25rem' }}>{q.id}. {q.question}</p>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {q.options.map((option: string, index: number) => {
                      const isSelected = answers[q.id] === index;
                      const isCorrect = index === parseInt(q.correctAnswer);
                      let bg = 'rgba(255,255,255,0.05)';
                      let border = '1px solid rgba(255,255,255,0.1)';
                      
                      if (submitted) {
                        if (isCorrect) {
                          bg = 'rgba(16, 185, 129, 0.2)';
                          border = '1px solid #10b981';
                        } else if (isSelected) {
                          bg = 'rgba(239, 68, 68, 0.2)';
                          border = '1px solid #ef4444';
                        }
                      } else if (isSelected) {
                        bg = 'hsl(var(--primary))';
                        border = '1px solid hsl(var(--primary))';
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswer(q.id, index)}
                          disabled={submitted}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '16px',
                            border: border,
                            background: bg,
                            color: 'white',
                            textAlign: 'left',
                            cursor: submitted ? 'default' : 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{['A', 'B', 'C', 'D'][index]}) {option}</span>
                          {submitted && isCorrect && <CheckCircle size={20} style={{ color: '#10b981' }} />}
                          {submitted && isSelected && !isCorrect && <XCircle size={20} style={{ color: '#ef4444' }} />}
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
                  style={{ 
                    width: '100%', 
                    padding: '1.5rem', 
                    fontSize: '1.25rem',
                    borderRadius: '20px',
                    marginTop: '2rem'
                  }}
                  disabled={Object.keys(answers).length < data?.questions.length}
                >
                  Testi Bitir ve Puanları Topla
                </button>
              ) : (
                <div className="card" style={{ 
                  textAlign: 'center', 
                  border: '2px solid hsl(var(--primary))',
                  padding: '3rem',
                  borderRadius: '32px',
                  background: 'rgba(var(--primary), 0.05)'
                }}>
                  <Star size={64} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Harika İş!</h2>
                  <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>{score} Puan Kazandın</p>
                  <button 
                    onClick={() => { setTopic(null); setData(null); setSubmitted(false); }} 
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem' }}
                  >
                    Yeni Bir Konuya Başla
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
