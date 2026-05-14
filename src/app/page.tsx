import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1e1b4b 0%, #09090b 100%)'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }} className="gradient-text">
          Akıllı Öğrenci Portalı
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '3rem' }}>
          Yapay zeka destekli ders notları, kişiselleştirilmiş sorular ve rekabetçi liderlik tablosu ile öğrenmeyi keyifli hale getir.
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
            Kayıt Ol
          </Link>
          <Link href="/login" className="btn" style={{ background: 'hsl(var(--secondary))', padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
            Giriş Yap
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '6rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h3>AI Ders Notları</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>Gemini Pro ile her konu için özel notlar.</p>
        </div>
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
          <h3>Akıllı Sorular</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>Konuyu pekiştiren yapay zeka soruları.</p>
        </div>
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔥</div>
          <h3>Rekabet</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>Puan topla, liderlik tablosunda yüksel.</p>
        </div>
      </div>
    </div>
  );
}
