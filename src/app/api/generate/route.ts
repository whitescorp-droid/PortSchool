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

    // API Key Güvenlik Kontrolü ve Loglama
    const key = process.env.API_KEY || '';
    console.log(`AI Request: Subject=${subject}, Topic=${topic}, Key starts with: ${key.substring(0, 5)}...`);

    const prompt = `
      Sen profesyonel bir öğretmensin. 
      ${grade}. sınıf öğrencisi için "${subject}" dersinin "${topic}" konusu hakkında:
      1. Detaylı, anlaşılır ve ilgi çekici ders notları hazırla. (Markdown formatında)
      2. Bu konuyla ilgili 3 adet çoktan seçmeli soru hazırla. Her sorunun 4 şıkkı (A, B, C, D) ve 1 doğru cevabı olsun.
      
      Yanıtı şu JSON formatında ver:
      {
        "content": "markdown_formatında_ders_notları",
        "questions": [
          {
            "id": 1,
            "question": "soru_metni",
            "options": ["A_şıkkı", "B_şıkkı", "C_şıkkı", "D_şıkkı"],
            "correctAnswer": "doğru_şık_endeksi_0_3"
          }
        ]
      }
      Sadece JSON döndür.
    `;

    // Model seçimi (Alternatifleri dene)
    let model;
    let text = '';
    
    try {
      console.log('Trying gemini-1.5-flash...');
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (sdkError: any) {
      console.error('SDK Error:', sdkError.message || sdkError);
      
      // Direct Fetch Fallback
      console.log('SDK failed, attempting direct fetch...');
      const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (!fetchRes.ok) {
        const errorData = await fetchRes.json();
        console.error('Direct Fetch Error:', JSON.stringify(errorData));
        throw new Error(`AI Service failed: ${fetchRes.statusText}`);
      }
      
      const fetchResult = await fetchRes.json();
      text = fetchResult.candidates[0].content.parts[0].text;
    }
    
    // JSON temizleme
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('CRITICAL AI ERROR:', error.message || error);
    return NextResponse.json({ 
      error: 'İçerik üretilirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}
