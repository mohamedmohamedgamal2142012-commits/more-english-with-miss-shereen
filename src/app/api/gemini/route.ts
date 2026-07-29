import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function POST(req: Request) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
  }

  try {
    const { text, lang } = await req.json();
    const systemPrompt = "You are an intelligent English teaching assistant for the Egyptian curriculum. Detect the language of the student's question (Arabic or English). ALWAYS respond in the SAME language the student used. If the student writes in Arabic, reply in Arabic. If the student writes in English, reply in English. Answer clearly, accurately, and helpfully. If you cannot answer, say 'I am not able to answer that yet.' (Arabic: 'لا أستطيع الإجابة على هذا السؤال بعد.').";

    const userMessage = `${lang === "ar" ? "[Student wrote in Arabic, reply in Arabic]" : "[Student wrote in English, reply in English]"} ${text}`;

    console.log("OpenRouter request:", { model: MODEL, text: text.substring(0, 50), hasKey: !!OPENROUTER_API_KEY });

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://more-english-with-miss-shereen.vercel.app",
        "X-Title": "More English AI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const rawBody = await openrouterRes.text();
    console.log("OpenRouter response:", openrouterRes.status, rawBody.substring(0, 200));

    if (!openrouterRes.ok) throw new Error(`OpenRouter HTTP ${openrouterRes.status}: ${rawBody.substring(0, 200)}`);
    const data = JSON.parse(rawBody);
    const reply = data.choices?.[0]?.message?.content || (lang === "ar" ? "عذراً، لم أتمكن من الإجابة على هذا السؤال." : "Sorry, I could not answer that.");
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("OpenRouter error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}