import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

export async function POST(req: Request) {
  try {
    const { subject, topic, grade } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Ders ve konu gereklidir.' }, { status: 400 });
    }

    const key = process.env.API_KEY || '';
    console.log(`AI Request: Subject=${subject}, Topic=${topic}`);

    const prompt = `
      Sen profesyonel bir öğretmensin. 
      ${grade || '9'}. sınıf öğrencisi için "${subject}" dersinin "${topic}" konusu hakkında:
      1. Detaylı, anlaşılır ve ilgi çekici ders notları hazırla. (Markdown formatında)
      2. Bu konuyla ilgili 3 adet çoktan seçmeli soru hazırla. Her sorunun 4 şıkkı (A, B, C, D) ve 1 doğru cevabı olsun.
      
      Yanıtı sadece aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
      {
        "content": "markdown_formatında_ders_notları",
        "questions": [
          {
            "id": 1,
            "question": "soru_metni",
            "options": ["A_şıkkı", "B_şıkkı", "C_şıkkı", "D_şıkkı"],
            "correctAnswer": "0"
          }
        ]
      }
    `;

    // Genişletilmiş Deneme Listesi (Sürüm + Model)
    const configurations = [
      { ver: 'v1beta', model: 'gemini-1.5-flash' },
      { ver: 'v1', model: 'gemini-1.5-flash' },
      { ver: 'v1beta', model: 'gemini-1.5-flash-latest' },
      { ver: 'v1beta', model: 'gemini-pro' },
      { ver: 'v1', model: 'gemini-pro' }
    ];

    let text = '';
    let success = false;
    let lastError = '';

    for (const config of configurations) {
      if (success) break;
      
      try {
        console.log(`Trying ${config.model} on ${config.ver}...`);
        const apiUrl = `https://generativelanguage.googleapis.com/${config.ver}/models/${config.model}:generateContent?key=${key}`;
        
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          const result = await res.json();
          text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            success = true;
            console.log(`Success with ${config.model} (${config.ver})`);
          }
        } else {
          const errorData = await res.json();
          lastError = `${config.ver}/${config.model} -> ${res.status}: ${errorData.error?.message || res.statusText}`;
        }
      } catch (err: any) {
        lastError = `${config.ver}/${config.model} -> Connection Error: ${err.message}`;
      }
    }

    if (!success) {
      throw new Error(`Tüm modeller ve sürümler denendi. Son hata: ${lastError}`);
    }

    // JSON'ı metnin içinden regex ile ayıkla
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Yapay zeka geçerli bir JSON yanıtı oluşturamadı. Lütfen tekrar deneyin.');
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('AI GENERATION FAILED:', error);
    return NextResponse.json({ 
      error: 'İçerik üretilirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}
