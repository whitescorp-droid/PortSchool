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
      ${grade || '9'}. sınıf öğrencisi için "${subject}" dersinin "${topic}" konusu hakkında:
      1. Detaylı, anlaşılır ve ilgi çekici ders notları hazırla. (Markdown formatında)
      2. Bu konuyla ilgili 3 adet çoktan seçmeli soru hazırla.
      3. Konuyu görselleştiren, interaktif, animasyonlu bir HTML/JS/CSS simülasyonu kodu hazırla.
      
      ÖNEMLİ KURALLAR:
      - Yanıtı iki parça halinde ver:
      - PARÇA 1: Aşağıdaki JSON formatında (Metin ve sorular):
        {
          "content": "markdown_formatı",
          "questions": [
            {
              "id": 1,
              "question": "soru_metni",
              "visual": "<svg>...</svg> (Gerekirse konuyu anlatan vektörel çizim, yoksa boş string)",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": "0"
            }
          ]
        }
      - PARÇA 2: Simülasyon kodunu SADECE <simulation_area>...</simulation_area> etiketleri içine yaz.
      - Başka hiçbir açıklama metni ekleme.
    `;

    const key = (process.env.API_KEY || '').trim();
    
    // Debug: Key format kontrolü (Güvenli şekilde)
    console.log(`KEY DEBUG: Starts with ${key.substring(0, 3)}, Ends with ${key.substring(key.length - 3)}, Length: ${key.length}`);

    // Sizin anahtarınızın desteklediği güncel modeller (2026 standartları)
    const configurations = [
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

    // 1. JSON Ayrıştırma
    let jsonData: any = {};
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ""));
      } catch (e) {
        console.error('JSON Parse Error:', e);
      }
    }

    // 2. Simülasyon Kodu Ayrıştırma (Etiket içinden)
    let simulationCode = '';
    const simMatch = text.match(/<simulation_area>([\s\S]*?)<\/simulation_area>/);
    if (simMatch) {
      simulationCode = simMatch[1].trim();
    } else {
      // Fallback: Eğer etiket yoksa ama kod blokları varsa onları dene
      const codeBlockMatch = text.match(/```html([\s\S]*?)```/);
      if (codeBlockMatch) simulationCode = codeBlockMatch[1].trim();
    }

    return NextResponse.json({
      ...jsonData,
      simulationCode: simulationCode || jsonData.simulationCode
    });

  } catch (error: any) {
    console.error('AI GENERATION FAILED:', error);
    return NextResponse.json({ 
      error: 'İçerik üretilirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}
