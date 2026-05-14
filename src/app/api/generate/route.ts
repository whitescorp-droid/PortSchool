import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { subject, topic, grade } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Ders ve konu gereklidir.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON temizleme (bazı durumlarda markdown blokları içine alabiliyor)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'İçerik üretilirken bir hata oluştu.' }, { status: 500 });
  }
}
