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
      2. Bu konuyla ilgili 3 adet çoktan seçmeli soru hazırla. Her sorunun 4 şıkkı (A, B, C, D) ve 1 doğru cevabı olsun.
      
      ÖNEMLİ KURALLAR:
      - Yanıtı SADECE saf JSON formatında ver.
      - JSON içindeki string değerlerde çift tırnak (") kullanman gerekirse mutlaka önüne ters eğik çizgi koy: \\"
      - Yeni satırlar için mutlaka \\n karakterini kullan, gerçek yeni satıra geçme.
      - Başka hiçbir açıklama metni ekleme.
      
      JSON FORMATI:
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
      // KRİTİK ADIM: Mevcut modelleri listele (Neden 404 alıyoruz?)
      let availableModels = 'Bilinmiyor';
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          availableModels = listData.models?.map((m: any) => m.name.replace('models/', '')).join(', ') || 'Model listesi boş';
        } else {
          availableModels = `Liste alınamadı (${listRes.status})`;
        }
      } catch (e) {
        availableModels = 'Liste sorgusu başarısız';
      }

      throw new Error(`Modeller denendi ancak bulunamadı. \nSenin anahtarının desteklediği modeller: ${availableModels}. \nSon Hata: ${lastError}`);
    }

    // JSON'ı metnin içinden regex ile ayıkla ve temizle
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Yapay zeka geçerli bir JSON yanıtı oluşturamadı. Lütfen tekrar deneyin.');
    }

    let cleanJson = jsonMatch[0];
    
    // JSON'ı bozan yaygın karakterleri temizle
    try {
      // Önce doğrudan deniyoruz
      const data = JSON.parse(cleanJson);
      return NextResponse.json(data);
    } catch (parseError) {
      console.log('Standard JSON parse failed, attempting deep clean...');
      // Eğer doğrudan parse edilemezse, string içindeki kontrol karakterlerini ve kaçış hatalarını temizle
      cleanJson = cleanJson
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Görünmez kontrol karakterlerini sil
        .replace(/\\'/g, "'") // Yanlış kaçışlı tek tırnakları düzelt
        .replace(/(?<!\\)"/g, '"'); // (Eğer gerekirse daha karmaşık regex eklenebilir)
        
      try {
        const data = JSON.parse(cleanJson);
        return NextResponse.json(data);
      } catch (finalError: any) {
        console.error('Final JSON Parse Error:', finalError.message);
        console.error('Problematic JSON snippet:', cleanJson.substring(0, 500));
        throw new Error(`İçerik formatı çözümlenemedi. (Hata: ${finalError.message})`);
      }
    }

  } catch (error: any) {
    console.error('AI GENERATION FAILED:', error);
    return NextResponse.json({ 
      error: 'İçerik üretilirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}
