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


    const prompt = `
      Sen profesyonel bir öğretmensin. 
      ${grade || '9'}. sınıf öğrencisi için "${subject}" dersinin "${topic}" konusu hakkında bir eğitim paketi hazırla.
      
      YANIT FORMATI (KESİNLİKLE BU SIRAYLA VE BU ETİKETLERLE):
      
      <content_area>
      Buraya konuyu anlatan detaylı, markdown formatında ders notlarını yaz.
      </content_area>
      
      <simulation_area>
      Buraya konuyu anlatan interaktif HTML/JS/CSS simülasyon kodunu yaz.
      ÖNEMLİ: Koyu temaya uygun (#0f0f14) olsun. body { margin: 0; overflow: hidden; } kullan.
      </simulation_area>
      
      <questions_json>
      [
        {
          "id": 1,
          "question": "soru_metni",
          "visual": "<svg>...</svg> (ÖNEMLİ: Çizimlerde mutlaka stroke='white' veya stroke='#e2e8f0' gibi açık renkler kullan!)",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "0"
        }
      ]
      </questions_json>
    `;

    const key = (process.env.API_KEY || '').trim();
    
    // Debug: Key format kontrolü (Güvenli şekilde)
    console.log(`KEY DEBUG: Starts with ${key.substring(0, 3)}, Ends with ${key.substring(key.length - 3)}, Length: ${key.length}`);

    // Kota dostu (429 hatasını azaltmak için) hafif ve hızlı modeller
    const configurations = [
      { ver: 'v1beta', model: 'gemini-2.0-flash-lite' },
      { ver: 'v1beta', model: 'gemini-2.0-flash' },
      { ver: 'v1beta', model: 'gemini-flash-latest' },
      { ver: 'v1beta', model: 'gemini-pro-latest' }
    ];

    let text = '';
    let success = false;
    let lastError = '';

    for (const config of configurations) {
      if (success) break;
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/${config.ver}/models/${config.model}:generateContent?key=${key}`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (res.ok) {
          const result = await res.json();
          text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) success = true;
        } else {
          const errorData = await res.json();
          lastError = `${config.ver}/${config.model} -> ${res.status}: ${errorData.error?.message || res.statusText}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!success) {
      throw new Error(`Modeller denendi ancak bulunamadı. Son Hata: ${lastError}`);
    }

    // 1. Ders Notu Ayrıştırma
    const contentMatch = text.match(/<content_area>([\s\S]*?)<\/content_area>/);
    let content = contentMatch ? contentMatch[1].trim() : '';

    // FALLBACK: Eğer etiket bulunamadıysa ama ham metin varsa onu kullan
    if (!content && text.length > 100) {
      content = text.replace(/<[\s\S]*?>/g, '').substring(0, 5000); // Etiketleri temizle ve kullan
    }

    // 2. Simülasyon Kodu Ayrıştırma
    const simMatch = text.match(/<simulation_area>([\s\S]*?)<\/simulation_area>/);
    const simulationCode = simMatch ? simMatch[1].trim() : '';

    // 3. Sorular JSON Ayrıştırma
    let questions = [];
    const questionsMatch = text.match(/<questions_json>([\s\S]*?)<\/questions_json>/);
    if (questionsMatch) {
      try {
        const cleanJson = questionsMatch[1].replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
        questions = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Questions JSON Parse Error:', e);
      }
    }

    if (!content && !simulationCode && questions.length === 0) {
      throw new Error('Yapay zeka yanıt verdi ancak içerik ayıklanamadı. Lütfen tekrar deneyin.');
    }

    return NextResponse.json({
      content: content || 'İçerik hazırlanırken bir sorun oluştu.',
      simulationCode,
      questions: Array.isArray(questions) ? questions : []
    });

  } catch (error: any) {
    console.error('AI GENERATION FAILED:', error);
    return NextResponse.json({ 
      error: 'İçerik üretilirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}
