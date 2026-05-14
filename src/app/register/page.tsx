'use client';

import { registerAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: '100%' }}>
      {pending ? 'Kaydediliyor...' : 'Kayıt Ol'}
    </button>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await registerAction(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h1 className="gradient-text" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Öğrenci Portalı</h1>
        <p style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>Yeni hesap oluşturun</p>
        
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
        <form action={handleSubmit}>
          <div className="input-group">
            <label>Ad Soyad</label>
            <input name="fullName" type="text" placeholder="Ali Yılmaz" required />
          </div>
          
          <div className="input-group">
            <label>E-posta</label>
            <input name="email" type="email" placeholder="ali@okul.com" required />
          </div>
          
          <div className="input-group">
            <label>Şifre</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          
          <div className="input-group">
            <label>Sınıf</label>
            <select name="grade" required>
              <option value="9">9. Sınıf</option>
              <option value="10">10. Sınıf</option>
              <option value="11">11. Sınıf</option>
              <option value="12">12. Sınıf</option>
            </select>
          </div>
          
          <SubmitButton />
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Zaten hesabınız var mı? <Link href="/login" style={{ color: 'hsl(var(--primary))' }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
