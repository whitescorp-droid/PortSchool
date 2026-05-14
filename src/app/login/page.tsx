'use client';

import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: '100%' }}>
      {pending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
    </button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await loginAction(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h1 className="gradient-text" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Tekrar Hoş Geldin</h1>
        <p style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>Öğrenci girişi yapın</p>
        
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
        <form action={handleSubmit}>
          <div className="input-group">
            <label>E-posta</label>
            <input name="email" type="email" placeholder="ali@okul.com" required />
          </div>
          
          <div className="input-group">
            <label>Şifre</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          
          <SubmitButton />
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Hesabınız yok mu? <Link href="/register" style={{ color: 'hsl(var(--primary))' }}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}
